<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileFieldOfStudyOptions
{
    public const OTHER_VALUE = '__other__';

    private const SELECT_OCCUPATIONS = [
        'student',
    ];

    public static function options(): array
    {
        $raw = Setting::get('profile_field_of_study_options', '');

        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $raw = $decoded;
            }
        }

        $items = is_array($raw)
            ? $raw
            : preg_split('/\r\n|\r|\n/', (string) $raw);

        $normalized = [];

        foreach ($items as $item) {
            $value = trim((string) $item);

            if ($value === '' || in_array($value, $normalized, true)) {
                continue;
            }

            $normalized[] = $value;
        }

        return $normalized;
    }

    public static function selectOccupations(): array
    {
        return self::SELECT_OCCUPATIONS;
    }

    public static function usesConfiguredList(?string $occupation): bool
    {
        return in_array((string) $occupation, self::SELECT_OCCUPATIONS, true);
    }

    public static function rules(Request $request): array
    {
        $usesConfiguredList = self::usesConfiguredList($request->input('occupation'));
        $allowedValues = array_merge([''], self::options(), [self::OTHER_VALUE]);

        return [
            'field_of_study' => $usesConfiguredList
                ? ['nullable', 'string', 'max:255', Rule::in($allowedValues)]
                : ['nullable', 'string', 'max:255'],
            'field_of_study_other' => [
                Rule::requiredIf(
                    $usesConfiguredList
                    && $request->input('field_of_study') === self::OTHER_VALUE
                ),
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }

    public static function normalize(array $validated): array
    {
        $fieldOfStudy = trim((string) ($validated['field_of_study'] ?? ''));
        $fieldOfStudyOther = trim((string) ($validated['field_of_study_other'] ?? ''));

        if (self::usesConfiguredList($validated['occupation'] ?? null)
            && $fieldOfStudy === self::OTHER_VALUE) {
            $fieldOfStudy = $fieldOfStudyOther;
        }

        $validated['field_of_study'] = $fieldOfStudy !== '' ? $fieldOfStudy : null;
        unset($validated['field_of_study_other']);

        return $validated;
    }
}

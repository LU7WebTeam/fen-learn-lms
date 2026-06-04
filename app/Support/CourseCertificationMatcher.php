<?php

namespace App\Support;

use App\Models\CourseCertification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CourseCertificationMatcher
{
    public function selectForUser(User $user, iterable $certifications): ?CourseCertification
    {
        $ordered = Collection::make($certifications)
            ->filter(fn ($cert) => $cert instanceof CourseCertification && $cert->is_active)
            ->sortBy([
                ['priority', 'asc'],
                ['id', 'asc'],
            ]);

        foreach ($ordered as $certification) {
            if ($this->matches($user, $certification->conditions_json ?? [])) {
                return $certification;
            }
        }

        return null;
    }

    public function matches(User $user, array $conditions): bool
    {
        if (! $this->matchesListCondition($user->occupation, $conditions['occupation'] ?? null)) {
            return false;
        }

        if (! $this->matchesOrganizationCondition($user->organization, $conditions['organization'] ?? null)) {
            return false;
        }

        if (! $this->matchesListCondition($user->state, $conditions['state'] ?? null)) {
            return false;
        }

        if (! $this->matchesAgeCondition($user, $conditions['age'] ?? null)) {
            return false;
        }

        return true;
    }

    protected function matchesListCondition(?string $actual, ?array $condition): bool
    {
        if (! ($condition['enabled'] ?? false)) {
            return true;
        }

        $values = collect($condition['values'] ?? [])
            ->map(fn ($value) => $this->normalize($value))
            ->filter()
            ->values();

        if ($values->isEmpty()) {
            return true;
        }

        $actualValue = $this->normalize($actual);

        if ($actualValue === '') {
            return false;
        }

        return $values->contains($actualValue);
    }

    protected function matchesOrganizationCondition(?string $actual, ?array $condition): bool
    {
        if (! ($condition['enabled'] ?? false)) {
            return true;
        }

        $values = collect($condition['values'] ?? [])
            ->map(fn ($value) => $this->normalize($value))
            ->filter()
            ->values();

        if ($values->isEmpty()) {
            return true;
        }

        $actualValue = $this->normalize($actual);

        if ($actualValue === '') {
            return false;
        }

        $mode = $condition['mode'] ?? 'exact';

        if ($mode === 'contains') {
            return $values->contains(fn ($needle) => str_contains($actualValue, $needle));
        }

        return $values->contains($actualValue);
    }

    protected function matchesAgeCondition(User $user, ?array $condition): bool
    {
        if (! ($condition['enabled'] ?? false)) {
            return true;
        }

        if (! $user->birthdate) {
            return false;
        }

        $age = Carbon::parse($user->birthdate)->age;
        $min = isset($condition['min']) ? (int) $condition['min'] : null;
        $max = isset($condition['max']) ? (int) $condition['max'] : null;

        if (! is_null($min) && $age < $min) {
            return false;
        }

        if (! is_null($max) && $age > $max) {
            return false;
        }

        return true;
    }

    protected function normalize($value): string
    {
        return mb_strtolower(trim((string) ($value ?? '')));
    }
}

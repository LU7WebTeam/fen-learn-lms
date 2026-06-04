<?php

namespace App\Http\Requests;

use App\Support\ProfileFieldOfStudyOptions;
use App\Support\ProfileOrganizationOptions;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'gender'      => ['required', 'in:male,female'],
            'race'        => ['required', 'in:malay,chinese,indian,other_bumiputera,other'],
            'state'       => ['required', 'string', 'max:100'],
            'birthdate'   => ['required', 'date', 'before:today'],
            'occupation'  => ['required', 'string', 'max:100'],
            'occupation_other' => ['nullable', 'string', 'max:150', 'required_if:occupation,other'],
            'student_id'  => ['nullable', 'string', 'max:100', 'required_if:occupation,student'],
            'avatar_file' => ['nullable', 'file', 'image', 'max:2048'],
            'avatar_clear'=> ['nullable', 'boolean'],
            'email'       => ['prohibited'],
        ]
            + ProfileOrganizationOptions::rules($this)
            + ProfileFieldOfStudyOptions::rules($this);
    }
}

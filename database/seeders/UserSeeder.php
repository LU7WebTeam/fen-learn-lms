<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed users with stable credentials for local development.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        User::updateOrCreate(
            ['email' => 'admin@fenlearn.test'],
            [
                'name' => 'Super Admin',
                'role' => 'super_admin',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'editor@fenlearn.test'],
            [
                'name' => 'Content Editor',
                'role' => 'content_editor',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'learner@fenlearn.test'],
            [
                'name' => 'Learner User',
                'role' => 'learner',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        // Create extra learners without relying on Faker (not installed in --no-dev).
        for ($i = 1; $i <= 10; $i++) {
            User::updateOrCreate(
                ['email' => "learner{$i}@fenlearn.test"],
                [
                    'name' => "Learner {$i}",
                    'role' => 'learner',
                    'password' => $password,
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}

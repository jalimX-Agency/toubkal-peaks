<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Http\Controllers\Admin\UserController;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Throwable;

class CreateAdmin extends Command
{
    protected $signature = 'toubkal:create-admin
        {--email= : Email address of the new account}
        {--name= : Display name (default: the part of the email before @)}
        {--role=admin : admin or staff}';

    protected $description = 'Create an admin account and email it a temporary password (or resend one if the account exists)';

    public function handle(): int
    {
        $email = (string) $this->option('email');
        $role = UserRole::tryFrom((string) $this->option('role'));
        if (Validator::make(['email' => $email], ['email' => 'required|email'])->fails() || ! $role) {
            $this->error('Use --email=<address> and --role=admin|staff.');

            return self::FAILURE;
        }

        try {
            $existing = User::where('email', $email)->first();
            if ($existing) {
                $existing->update(['role' => $role, 'is_active' => true]);
                UserController::sendTemporaryPassword($existing);
                $this->info("Account already existed: a new temporary password was emailed to {$email}.");
            } else {
                UserController::invite($this->option('name') ?: strstr($email, '@', true), $email, $role);
                $this->info("Account created: the temporary password was emailed to {$email}.");
            }
        } catch (Throwable $e) {
            $this->error('The email could not be sent, so nothing was changed: '.$e->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}

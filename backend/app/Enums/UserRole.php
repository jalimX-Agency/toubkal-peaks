<?php

namespace App\Enums;

/** Team accounts for the admin: staff run bookings, trips and reviews; admins also manage accounts. */
enum UserRole: string
{
    case Admin = 'admin';
    case Staff = 'staff';
}

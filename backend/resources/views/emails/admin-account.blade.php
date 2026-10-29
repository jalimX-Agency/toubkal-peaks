<!doctype html>
<html lang="en">
<body style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1a1a1a; line-height: 1.5;">
    <h2>Hello {{ $user->name }},</h2>
    <p>You now have access to the Toubkal Peaks admin ({{ $user->role->value === 'admin' ? 'administrator' : 'team member' }}).</p>
    <table style="border-collapse: collapse;">
        <tr><td style="padding: 6px 12px 6px 0;"><strong>Sign in</strong></td><td style="padding: 6px 0;"><a href="{{ $loginUrl }}">{{ $loginUrl }}</a></td></tr>
        <tr><td style="padding: 6px 12px 6px 0;"><strong>Email</strong></td><td style="padding: 6px 0;">{{ $user->email }}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0;"><strong>Temporary password</strong></td><td style="padding: 6px 0; font-family: monospace; font-size: 16px;">{{ $password }}</td></tr>
    </table>
    <p>You will be asked to choose your own password when you sign in for the first time.</p>
    <p style="color: #666;">If you did not expect this email, you can ignore it.</p>
</body>
</html>

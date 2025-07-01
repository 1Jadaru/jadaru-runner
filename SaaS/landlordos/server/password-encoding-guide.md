# Password URL Encoding Guide

If your PostgreSQL password contains special characters, they need to be URL-encoded in the DATABASE_URL:

## Common Characters That Need Encoding:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- `:` becomes `%3A`
- `/` becomes `%2F`
- `?` becomes `%3F`
- `&` becomes `%26`
- `=` becomes `%3D`
- `+` becomes `%2B`
- ` ` (space) becomes `%20`

## Example:
If your password is: `my@password#123`
It should be encoded as: `my%40password%23123`

## Your Current Password Analysis:
Looking at: `es1370Nicole258admin`
This password appears to have no special characters that need encoding.

## Alternative Approach:
If URL encoding doesn't work, you can also:
1. Change your PostgreSQL user password to something without special characters
2. Create a dedicated database user for the application

## Commands to Change Password:
```sql
-- Connect to PostgreSQL as admin
ALTER USER postgres PASSWORD 'newpassword123';
```

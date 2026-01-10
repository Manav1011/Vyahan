
# Django Batteries Included Boilerplate

A ready-to-clone Django boilerplate for rapid API development with batteries included:

## Features

- **Custom User Model**: Uses email as the unique identifier instead of username.
- **Django REST Framework**: Pre-configured for API development.
- **JWT Authentication**: Secure endpoints with JSON Web Tokens (using djangorestframework-simplejwt).
- **Swagger & ReDoc API Docs**: Interactive documentation with JWT support (drf-yasg).
- **User CRUD API**: All user management endpoints are available and JWT-protected.
- **Unprotected Signup API**: Anyone can register via `/api/signup/`.
- **Consistent API Response Schema**: All APIs can use a base response format with `status_code`, `message`, `data`, and `error`.
- **Easy App Extension**: Add new apps and APIs, and they will be auto-documented in Swagger.

## Quick Start

1. Clone this repo and install dependencies:
	```sh
	pip install -r requirements.txt
	```
2. Run migrations:
	```sh
	python manage.py migrate
	```
3. Create a superuser:
	```sh
	python manage.py createsuperuser
	```
4. Start the server:
	```sh
	python manage.py runserver
	```
5. Access API docs at `/swagger/` or `/redoc/`.

## API Endpoints
- `/api/users/` - User CRUD (JWT required)
- `/api/signup/` - Register new user (open)
- `/api/token/` and `/api/token/refresh/` - JWT auth
- `/swagger/` and `/redoc/` - API docs

---

Ready for your next Django project!

import os
import yaml
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'drf_yasg',

    'baozi.networks',
    'baozi.pools',
    'baozi.users',
    'baozi.tokens',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'baozi.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'baozi.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'c4d'),
        'USER': os.getenv('POSTGRES_USER', 'c4d'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'c4d'),
        'HOST': os.getenv('POSTGRES_HOST', '127.0.0.1'),
        'PORT': os.getenv('POSTGRES_PORT', 5432),
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {
            "format": "%(asctime)s %(levelname)s %(pathname)s %(lineno)s %(funcName)s | %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "console",
        }
    },
    "loggers": {
        "": {
            "level": "INFO",
            "handlers": ["console"],
        },
        'gunicorn': {
         'level': 'DEBUG',
         'handlers': ['console'],
         'propagate': False
     }
    }
}

# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

USE_X_FORWARDED_HOST = True

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/


STATIC_URL = '/django-static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static/')

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

ADDRESS_LENGTH = 34
MAX_BLOCKS_FOR_FILTER = 5000

with open(os.path.dirname(__file__) + "/../config.yaml") as f:
    config = yaml.safe_load(f)

SECRET_KEY = config.get('DJANGO_SECRET_KEY')
DEBUG = config.get('DEBUG')
ALLOWED_HOSTS = config.get('ALLOWED_HOSTS')
CONTRACT_ADDRESS = config.get('CONTRACT_ADDRESS')
START_BLOCK_FOR_SCANNER = config.get('START_BLOCK_FOR_SCANNER')
ENDPOINT = config.get('ENDPOINT')
SCANNER_SLEEP_IN_SECONDS = config.get('SCANNER_SLEEP_IN_SECONDS')
MIN_BLOCKS_FOR_SCANNER = config.get('MIN_BLOCKS_FOR_SCANNER')

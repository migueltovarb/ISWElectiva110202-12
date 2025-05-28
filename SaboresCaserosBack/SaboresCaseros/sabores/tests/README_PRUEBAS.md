
# 🧪 Pruebas del Backend - SaboresCaseros

Este repositorio incluye una suite completa de pruebas para el backend del proyecto **SaboresCaseros**, construido con Django y Django REST Framework.

---

## ⚙️ Requisitos previos

Asegúrate de tener un entorno virtual activo y las siguientes dependencias instaladas:

```bash
pip install -r requirements.txt
pip install pytest pytest-django coverage
```

---

## 📁 Estructura de pruebas

Las pruebas están organizadas dentro de la carpeta:

```
sabores/
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_models.py              # Modelos Django
    ├── test_serializers.py         # Serializadores DRF
    ├── test_views.py               # Vistas (registro, perfil, métodos de pago, platillos)
    ├── test_jwt_full.py            # Login JWT, pedidos, reseñas, tickets, estadísticas
    ├── test_password_recovery.py   # Pregunta de seguridad y recuperación de contraseña
    ├── test_tickets.py             # Tickets de soporte
    ├── test_userviewset.py         # Endpoint /usuarios/chefs/
    ├── test_validations.py         # Validaciones (errores esperados)
    ├── test_permissions.py         # Seguridad y restricciones de acceso
    └── test_urls.py                # Resolución de rutas y JWT
```

---

## 🚀 Ejecutar TODAS las pruebas

Desde la raíz del proyecto, ejecuta:

```bash
pytest sabores/tests/
```

---

## ✅ Ejecutar una prueba específica

```bash
pytest sabores/tests/test_views.py
```

---

## 🔐 Ejecutar pruebas con autenticación JWT

```bash
pytest sabores/tests/test_jwt_full.py
```

---

## 📊 Ver reporte de cobertura

### 1. Ejecutar con coverage:

```bash
coverage run -m pytest sabores/tests/
coverage report -m
```

### 2. Generar reporte HTML visual:

```bash
coverage html
start htmlcov/index.html  # Solo en Windows
```

---

## 🧼 Buenas prácticas

- Usa `@pytest.mark.django_db` para cada prueba que interactúe con la base de datos.
- Usa `APIClient` para simular llamadas HTTP.
- Autentica usuarios con `.force_authenticate()` o tokens JWT.
- Crea fixtures reutilizables en `conftest.py`.

SaboresCaseros.

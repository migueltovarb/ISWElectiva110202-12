from rest_framework import viewsets
from .models import Tarea
from .serializers import TareaSerializer

class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all().order_by('-creado')
    serializer_class = TareaSerializer

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from relatorios.views import RelatorioViewSet, TrabalhadorViewSet, EquipamentoViewSet, ObraViewSet  
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static  # Adicione para servir arquivos de mídia
from django.urls import path
from rest_framework.views import APIView

router = DefaultRouter()
router.register(r'relatorios', RelatorioViewSet) # Recebeu a requisição
router.register(r'obras', ObraViewSet) 
router.register(r'trabalhadores', TrabalhadorViewSet)  
router.register(r'equipamentos', EquipamentoViewSet) 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('', RedirectView.as_view(url='api/'))
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
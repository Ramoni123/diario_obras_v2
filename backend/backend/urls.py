from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from relatorios.views import RelatorioViewSet, TrabalhadorViewSet, EquipamentoViewSet, ObraViewSet, UserViewSet
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static  # Adicione para servir arquivos de mídia
from django.urls import path
from rest_framework.views import APIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'relatorios', RelatorioViewSet) # Recebeu a requisição
router.register(r'obras', ObraViewSet) 
router.register(r'trabalhadores', TrabalhadorViewSet)  
router.register(r'equipamentos', EquipamentoViewSet) 
router.register(r'users',UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('', RedirectView.as_view(url='api/')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
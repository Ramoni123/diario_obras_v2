from django.contrib import admin
from .models import Obra, Trabalhador, Equipamento, Relatorio, Foto, EquipamentoRelatorio

admin.site.register(Equipamento)
admin.site.register(Trabalhador)
admin.site.register(Obra)
admin.site.register(Relatorio)
admin.site.register(Foto)
admin.site.register(EquipamentoRelatorio)
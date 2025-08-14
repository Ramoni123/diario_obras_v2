from rest_framework import serializers
# Importar o UniqueValidator
from rest_framework.validators import UniqueValidator
from .models import Relatorio, Trabalhador, Equipamento, Foto, Obra, EquipamentoRelatorio

class TrabalhadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trabalhador
        fields = ['id', 'Nome', 'Funcao']

# Serializer para escrita (POST, PUT) com validador explícito
class EquipamentoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipamento
        fields = ['id', 'Nome', 'Tipo']


# Serializer para leitura (GET)
class EquipamentoReadSerializer(serializers.ModelSerializer):
    em_uso = serializers.SerializerMethodField()

    class Meta:
        model = Equipamento
        fields = ['id', 'Nome', 'Tipo', 'em_uso']

    def get_em_uso(self, obj):
        return EquipamentoRelatorio.objects.filter(Equipamento=obj).exists()


class FotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Foto
        fields = ['id', 'Imagem']

class ObraSerializer(serializers.ModelSerializer):
    quantidade_relatorios =serializers.SerializerMethodField()
    status_legivel = serializers.CharField(source = 'get_Status_display', read_only = True)
    class Meta:
        model = Obra
        fields = ['id', 
                  'Nome', 
                  'Endereco', 
                  'Data_inicio', 
                  'Data_fim', 
                  'Status',
                  'quantidade_relatorios',
                  'status_legivel'
                  ]
        extra_kwargs = {
            'Status':{'write_only': True}
        }
    def get_quantidade_relatorios(self, obj):
            return obj.relatorios.count()


class EquipamentoRelatorioSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='Equipamento.id')
    Nome = serializers.CharField(source='Equipamento.Nome', read_only=True)
    Tipo = serializers.CharField(source='Equipamento.Tipo', read_only=True)

    class Meta:
        model = EquipamentoRelatorio
        fields = ['id', 'Nome', 'Tipo', 'Quantidade_usada']

class EquipamentoQuantidadeWriteSerializer(serializers.Serializer):
    Equipamento = serializers.IntegerField()
    Quantidade_usada = serializers.IntegerField(min_value=1)

class RelatorioSerializer(serializers.ModelSerializer):
    Trabalhadores_info = TrabalhadorSerializer(many=True, read_only=True, source='Trabalhadores')
    Equipamentos_info = EquipamentoRelatorioSerializer(source='equipamentorelatorio_set', many=True, read_only=True)
    fotos = FotoSerializer(many=True, read_only=True)
    Clima = serializers.CharField(source='get_Clima_display', read_only=True)
    Clima_value = serializers.CharField(source='Clima', read_only=True)
    Obra_info = ObraSerializer(source='Obra', read_only=True)
    Clima_input = serializers.ChoiceField(choices=Relatorio.CLIMA_CHOICES, write_only=True, source='Clima')
    Trabalhadores = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Trabalhador.objects.all(), write_only=True, required=False
    )
    equipamentos_com_quantidade = EquipamentoQuantidadeWriteSerializer(
        many=True, write_only=True, required=False
    )
    Obra = serializers.PrimaryKeyRelatedField(
        queryset=Obra.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Relatorio
        fields = [
            'id', 'Data', 'Descricao',
            'Clima', 'Clima_input', 'Clima_value',
            'Obra', 'Obra_info',
            'Trabalhadores', 'Trabalhadores_info',
            'Equipamentos_info', 'equipamentos_com_quantidade',
            'fotos'
        ]

    def create(self, validated_data):
        equipamentos_data = validated_data.pop('equipamentos_com_quantidade', [])
        trabalhadores_data = validated_data.pop('Trabalhadores', [])
        relatorio = Relatorio.objects.create(**validated_data)
        relatorio.Trabalhadores.set(trabalhadores_data)
        for eq_data in equipamentos_data:
            EquipamentoRelatorio.objects.create(
                Relatorio=relatorio,
                Equipamento_id=eq_data['Equipamento'],
                Quantidade_usada=eq_data['Quantidade_usada']
            )
        return relatorio

    def update(self, instance, validated_data):
        equipamentos_data = validated_data.pop('equipamentos_com_quantidade', [])
        trabalhadores_data = validated_data.pop('Trabalhadores', [])
        instance = super().update(instance, validated_data)
        instance.Trabalhadores.set(trabalhadores_data)
        EquipamentoRelatorio.objects.filter(Relatorio=instance).delete()
        for eq_data in equipamentos_data:
            EquipamentoRelatorio.objects.create(
                Relatorio=instance,
                Equipamento_id=eq_data['Equipamento'],
                Quantidade_usada=eq_data['Quantidade_usada']
            )
        return instance

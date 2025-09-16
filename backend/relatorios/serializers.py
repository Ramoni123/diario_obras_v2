from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Relatorio, Trabalhador, Equipamento, Foto, Obra, EquipamentoRelatorio
from django.contrib.auth.models import User, Group
from django.contrib.auth import get_user_model


User = get_user_model()

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
                  'Descricao',
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
    obra_info = ObraSerializer(source='Obra', read_only=True)
    Clima_input = serializers.ChoiceField(choices=Relatorio.CLIMA_CHOICES, write_only=True, source='Clima')
    Trabalhadores = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Trabalhador.objects.all(), write_only=True, required=False
    )
    equipamentos_com_quantidade = EquipamentoQuantidadeWriteSerializer(
        many=True, write_only=True, required=False
    )
    obra = serializers.PrimaryKeyRelatedField(
        queryset=Obra.objects.all(),source='Obra', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Relatorio
        fields = [
            'id', 'Data', 'Descricao',
            'Clima', 'Clima_input', 'Clima_value',
            'obra', 'obra_info',
            'Trabalhadores', 'Trabalhadores_info',
            'Equipamentos_info', 'equipamentos_com_quantidade',
            'fotos','obra'
        ]
        read_only_fields = ['id', 'Clima', 'Clima_value', 'obra_info', 'Trabalhadores_info', 'Equipamentos_info', 'fotos']

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

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["name"]

class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True) 

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'groups', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        try:
            engenheiros_group = Group.objects.get(name='Engenheiros')
            user.groups.add(engenheiros_group)
        except Group.DoesNotExist:
            print("AVISO: O grupo 'Engenheiros' não foi encontrado. O novo utilizador não foi adicionado a um grupo.")
        return user

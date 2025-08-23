from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Relatorio, Trabalhador, Equipamento, Foto, Obra, EquipamentoRelatorio
from .serializers import (
    RelatorioSerializer, 
    TrabalhadorSerializer, 
    EquipamentoReadSerializer,
    EquipamentoWriteSerializer,
    FotoSerializer, 
    ObraSerializer
)

class TrabalhadorViewSet(viewsets.ModelViewSet):
    queryset = Trabalhador.objects.all()
    serializer_class = TrabalhadorSerializer

class ObraViewSet(viewsets.ModelViewSet):
    queryset = Obra.objects.all().prefetch_related('relatorios')
    serializer_class = ObraSerializer

    @action (detail=True, methods=['get'])
    def relatorios(self, request, pk= None):
        obra = self.get_object()
        relatorios_da_obra = Relatorio.objects.filter(Obra=obra).order_by =('-Data')
        page = self.paginate_queryset(relatorios_da_obra)
        if page is not None:
            serializer = RelatorioSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = RelatorioSerializer(relatorios_da_obra, many = True)
        return Response(serializer.data)

class EquipamentoViewSet(viewsets.ModelViewSet):
    queryset = Equipamento.objects.all()
    # MUDANÇA: Remover a definição estática do serializer_class

    # MUDANÇA: Adicionar o método get_serializer_class para escolher o serializer
    # com base na ação (leitura ou escrita).
    def get_serializer_class(self):
        """
        Retorna um serializer diferente para operações de leitura (GET)
        e de escrita (POST, PUT, PATCH).
        """
        if self.action in ['create', 'update', 'partial_update']:
            return EquipamentoWriteSerializer
        return EquipamentoReadSerializer

    def destroy(self, request, *args, **kwargs):
        equipamento = self.get_object()

        # Verifique se o equipamento está associado a algum relatório
        if EquipamentoRelatorio.objects.filter(Equipamento=equipamento).exists():
            return Response(
                {'error': 'Este equipamento está vinculado a relatórios e não pode ser excluído.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)

class RelatorioViewSet(viewsets.ModelViewSet):
    queryset = Relatorio.objects.prefetch_related(
        'Trabalhadores',
        'equipamentorelatorio_set__Equipamento',
        'fotos'
    ).order_by('-Data')
    serializer_class = RelatorioSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['Obra']


    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtro por obra
        obra_id = self.request.query_params.get('obra')
        if obra_id:
            queryset = queryset.filter(Obra_id=obra_id)
            
        return queryset

    @action(detail=True, methods=['post'])
    def upload_fotos(self, request, pk=None):
        relatorio = self.get_object()
        imagens = request.FILES.getlist('imagens')
        
        if not imagens:
            return Response(
                {'status': 'Nenhuma imagem enviada'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        for imagem in imagens:
            Foto.objects.create(
                Relatorio=relatorio,
                Imagem=imagem
            )
        
        return Response(
            {'status': f'{len(imagens)} fotos adicionadas'},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def remover_fotos(self, request, pk=None):
        relatorio = self.get_object()
        ids_para_remover = request.data.get('ids', [])
        
        if not ids_para_remover:
            return Response(
                {'status': 'Nenhum ID de foto fornecido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        fotos_apagadas, _ = Foto.objects.filter(
            id__in=ids_para_remover,
            Relatorio=relatorio
        ).delete()

        if fotos_apagadas > 0:
            return Response(
                {'status': f'{fotos_apagadas} fotos removidas'},
                status=status.HTTP_200_OK
            )
        return Response(
            {'status': 'Nenhuma foto correspondente encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )

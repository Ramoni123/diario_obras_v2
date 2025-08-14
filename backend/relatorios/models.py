from django.db import models
from django.contrib.auth.models import User

class Obra(models.Model):
    STATUS_CHOICES = [
        ('andamento', 'Em andamento'),
        ('concluida', 'Concluída'),
        ('pausada', 'Em pausa'),
        ('cancelada', 'Cancelada'),
    ]
    usuario = models.ForeignKey(User, related_name="obras", on_delete=models.SET_NULL, null=True, blank=True)
    Nome = models.CharField(max_length=100)
    Endereco = models.TextField()
    Data_inicio = models.DateField()
    Data_fim = models.DateField(null=True, blank=True)
    Descricao = models.TextField(blank=True)
    Status = models.CharField(max_length = 20, choices=STATUS_CHOICES, default='andamento')
    
    def __str__(self):
        return self.Nome

class Trabalhador(models.Model):
    Nome = models.CharField(max_length=100)
    Funcao = models.CharField(max_length=100)
    
    def __str__(self):
        return self.Nome

class Equipamento(models.Model):
    Nome = models.CharField(max_length=100, unique=True)
    Tipo = models.CharField(max_length=100)

    
    def __str__(self):
        return self.Nome

class Relatorio(models.Model):
    CLIMA_CHOICES = [
        ('sol', 'Ensolarado'),
        ('parcial', 'Parcialmente Nublado'),
        ('nublado', 'Nublado'),
        ('chuva', 'Chuvoso'),
        ('vento', 'Ventoso'),
        ('chuva_forte', 'Chuva Forte'),
    ] 
    
    Obra = models.ForeignKey(Obra, 
                             related_name='relatorios', 
                             on_delete=models.CASCADE, 
                             db_column='id_obra')
    Data = models.DateField()
    Clima = models.CharField(max_length=30, choices=CLIMA_CHOICES)
    Trabalhadores = models.ManyToManyField(Trabalhador, blank=True)
    Equipamentos = models.ManyToManyField(Equipamento, through='EquipamentoRelatorio', blank=True)
    Descricao = models.TextField(blank=True)
    
    def __str__(self):
        if self.Data:
            return f"Relatório de {self.Data.strftime('%d/%m/%Y')}"
        return f"Relatório ID {self.id}"

class Foto(models.Model):
    Relatorio = models.ForeignKey(Relatorio, related_name='fotos', on_delete=models.CASCADE)
    Imagem = models.ImageField(upload_to='relatorios/fotos/')
    
    def __str__(self):
        return f"Foto {self.id} do Relatório {self.Relatorio.id}"

class EquipamentoRelatorio(models.Model):
    Relatorio = models.ForeignKey(Relatorio, on_delete=models.CASCADE)
    Equipamento = models.ForeignKey(Equipamento, on_delete=models.CASCADE)
    Quantidade_usada = models.PositiveIntegerField(default=1)
    
    class Meta:
        unique_together = [['Relatorio', 'Equipamento']]
    
    def __str__(self):
        return f"{self.Equipamento.Nome} - {self.Quantidade_usada} unidades"


    


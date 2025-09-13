from rest_framework import serializers
from .models import Product, ProductCategory, Order, Attachment

class AttachmentSerializer(serializers.ModelSerializer):
    file = serializers.ImageField(use_url=True)
    class Meta:
        model = Attachment
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = '__all__'

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'

from django.shortcuts import render

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product, ProductCategory, Order
from .serializers import ProductSerializer, ProductCategorySerializer

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.contrib.auth import get_user_model

User = get_user_model()

class ProductListView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(cache_page(60 * 60, key_prefix='product_list'))
    def get(self, request):
        products = Product.objects.all().prefetch_related('attachments')
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class ProductCategoryView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(cache_page(60 * 60, key_prefix='product_category_list'))
    def get(self, request):
        products = ProductCategory.objects.all()
        serializer = ProductCategorySerializer(products, many=True)
        return Response(serializer.data)

class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        serializer = ProductSerializer([order.product for order in orders], many=True)
        return Response(serializer.data)

    def post(self, request):
        # Check if this is a guest order during signup
        if 'email' in request.data:
            try:
                user = User.objects.get(email=request.data['email'])
                product_id = request.data.get('product_id')
                try:
                    product = Product.objects.get(id=product_id)
                    order = Order.objects.create(
                        product=product,
                        user=user
                    )
                    return Response({'status': 'success'})
                except Product.DoesNotExist:
                    return Response({'error': 'Product not found'}, status=404)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
        else:
            # Regular authenticated order
            product_id = request.data.get('product_id')
            try:
                product = Product.objects.get(id=product_id)
                order = Order.objects.create(
                    product=product,
                    user=request.user
                )
                return Response({'status': 'success'})
            except Product.DoesNotExist:
                return Response({'error': 'Product not found'}, status=404)
            except Exception as e:
                return Response({'error': str(e)}, status=400)

    def delete(self, request):
        product_id = request.data.get('product_id')
        try:
            order = Order.objects.get(product_id=product_id, user=request.user)
            order.delete()
            return Response({'status': 'success'})
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


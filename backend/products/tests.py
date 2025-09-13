from io import BytesIO
from PIL import Image

from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from .models import Product, ProductCategory, Order, Attachment
from .serializers import ProductSerializer


def generate_test_image(width=100, height=100, color=(155, 0, 0)) -> SimpleUploadedFile:
    file_obj = BytesIO()
    image = Image.new("RGB", (width, height), color)
    image.save(file_obj, "JPEG")
    file_obj.seek(0)
    return SimpleUploadedFile("test.jpg", file_obj.read(), content_type="image/jpeg")


@override_settings(MEDIA_ROOT="/tmp/test_media/")
class BaseSetup(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.category = ProductCategory.objects.create(name="Chairs", description="Seating")
        self.product = Product.objects.create(
            name="GAIA Armchair",
            description="Comfortable chair",
            price=199.99,
            quantity=5,
            image=generate_test_image(),
            category=self.category,
        )
        Attachment.objects.create(
            file=generate_test_image(color=(0, 155, 0)),
            file_type=Attachment.AttachmentType.PHOTO,
            product=self.product,
        )

        User = get_user_model()
        self.user = User.objects.create_user(
            email="user@example.com",
            password="strong-pass-123",
            first_name="Test",
            last_name="User",
        )

    def auth(self):
        self.client.force_authenticate(self.user)


class SmokeModelSerializerTests(BaseSetup):
    def test_product_str(self):
        self.assertIn(self.product.name, str(self.product))
        self.assertIn(self.category.name, str(self.product))

    def test_product_serializer_includes_attachments(self):
        data = ProductSerializer(self.product).data
        self.assertIn("attachments", data)
        self.assertGreaterEqual(len(data["attachments"]), 1)


class ProductEndpointsTests(BaseSetup):
    def test_products_list_get_ok(self):
        url = reverse("product-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_categories_list_get_ok(self):
        url = reverse("product-category")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)


class OrderEndpointsTests(BaseSetup):
    def test_orders_get_unauthorized(self):
        url = reverse("order-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_orders_post_and_get_authenticated(self):
        self.auth()
        url = reverse("order-list")
        # Create
        resp_post = self.client.post(url, {"product_id": self.product.id}, format="json")
        self.assertEqual(resp_post.status_code, status.HTTP_200_OK)
        self.assertTrue(Order.objects.filter(product=self.product, user=self.user).exists())
        # List
        resp_get = self.client.get(url)
        self.assertEqual(resp_get.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp_get.data), 1)
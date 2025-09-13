from django.db import models
from django.utils.translation import gettext_lazy as _

class ProductCategory(models.Model):
    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name  = 'category'
        verbose_name_plural = 'categories'


class Product(models.Model):
    name = models.CharField(max_length=256)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='product_images/')
    category = models.ForeignKey(to=ProductCategory, on_delete=models.CASCADE, to_field='name')

    class Meta:
        verbose_name  = 'product'
        verbose_name_plural = 'products'
        ordering = ['-id']

    def __str__(self):
        return f'Product: {self.name} | Category: {self.category.name}'

class Attachment(models.Model):
    class AttachmentType(models.TextChoices):
        PHOTO = "Photo", _("Photo")
        VIDEO = "Video", _("Video")

    file = models.ImageField('Attachment', upload_to='attachments/')
    file_type = models.CharField('File type', choices=AttachmentType.choices, max_length=10)
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='attachments', verbose_name='Related product')

    class Meta:
        verbose_name = 'Attachment'
        verbose_name_plural = 'Attachments'

    def __str__(self):
        return f'Attachment for {self.product.name} - {self.file_type}'


class Order(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey('accounts.UserAccount', on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)

    class Meta:
        verbose_name = 'order'
        verbose_name_plural = 'orders'


    def __str__(self):
        if self.user:
            return f'Order: {self.product.name} | User: {self.user.email}'
        return f'Order: {self.product.name} | Session: {self.session_key}'
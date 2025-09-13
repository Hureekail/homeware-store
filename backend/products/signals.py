from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Product, ProductCategory, Attachment


@receiver([post_save, post_delete], sender=Product)
def invalidate_product_cache(sender, instance, **kwargs):

    cache.delete_pattern("*product_list*")

@receiver([post_save, post_delete], sender=ProductCategory)
def invalidate_product_cache(sender, instance, **kwargs):

    cache.delete_pattern('*product_category_list*')


@receiver([post_save, post_delete], sender=Attachment)
def invalidate_product_list_attachment(sender, instance, **kwargs):
    cache.delete_pattern('*product_list*')
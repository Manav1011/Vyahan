from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_shipment, name='create_shipment'),
    path('list/', views.list_shipments, name='list_shipments'),
    path('<str:tracking_id>/', views.retrieve_shipment, name='retrieve_shipment'),
    path('<str:tracking_id>/update-status/', views.update_shipment_status, name='update_shipment_status'),
    path('track/<str:tracking_id>/', views.track_shipment, name='track_shipment'),
]

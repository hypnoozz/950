from django.urls import path
from .views import RegisterView, LoginView, LogoutView, AdminUserCreateView, AdminUserUpdateView
from gym_api.users.views import CurrentUserView

app_name = 'auth'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user/', CurrentUserView.as_view(), name='current-user'),
    path('admin/users/create/', AdminUserCreateView.as_view(), name='admin-user-create'),
    path('admin/users/update/<int:user_id>/', AdminUserUpdateView.as_view(), name='admin-user-update'),
] 
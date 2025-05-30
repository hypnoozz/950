from rest_framework import serializers
from .models import MembershipPlan, Order, OrderItem
from gym_api.users.serializers import UserSerializer

class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = [
            'id', 'name', 'plan_type', 'duration', 'price',
            'description', 'benefits', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class OrderItemSerializer(serializers.ModelSerializer):
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all(), required=False)
    item_total = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 
            'item_type', 'item_id', 'quantity', 'price', 'item_total',
        ]
        read_only_fields = ['id']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_info = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'user', 'user_info', 'order_type',
            'status', 'status_display', 'total_amount', 'discount_amount',
            'actual_amount', 'payment_method', 'payment_id', 'paid_at',
            'remark', 'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'order_id', 'created_at', 'updated_at']
    
    def get_user_info(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'name': obj.user.get_full_name(),
            'member_id': obj.user.member_id
        }

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = [
            'total_amount', 
            'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            # 确保有item_price和quantity
            if 'item_price' in item_data and 'quantity' in item_data:
                # 计算item_total
                if 'item_total' not in item_data:
                    item_data['item_total'] = item_data['item_price'] * item_data['quantity']
            
            # 创建订单项
            OrderItem.objects.create(order=order, **item_data)
        
        return order

class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'status', 'payment_method', 'payment_id', 'paid_at', 'remark'
        ]
        
    def validate(self, data):
        """
        验证订单状态变更是否有效
        """
        # 获取当前订单实例
        instance = self.instance
        
        # 获取要更新的状态
        new_status = data.get('status', instance.status)
        
        # 如果是修改状态为已支付，但没有提供支付方式和支付时间，则报错
        if new_status == 'paid' and instance.status == 'pending':
            payment_method = data.get('payment_method')
            paid_at = data.get('paid_at')
            
            if not payment_method:
                raise serializers.ValidationError('支付状态更新为已支付时，必须提供支付方式')
            
            if not paid_at:
                raise serializers.ValidationError('支付状态更新为已支付时，必须提供支付时间')
        
        # 如果订单已取消或已退款，不允许修改为已支付
        if instance.status in ['cancelled', 'refunded'] and new_status == 'paid':
            raise serializers.ValidationError('已取消或已退款的订单不能修改为已支付状态')
            
        return data 
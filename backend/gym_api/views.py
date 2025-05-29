from django.views.generic import TemplateView

class IndexView(TemplateView):
    template_name = 'index.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # 可以在这里添加任何需要传递到模板的上下文数据
        return context 
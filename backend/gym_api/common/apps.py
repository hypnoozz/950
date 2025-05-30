from django.apps import AppConfig

class CommonConfig(AppConfig):
    name = 'gym_api.common'

    def ready(self):
        import gym_api.common.admin 
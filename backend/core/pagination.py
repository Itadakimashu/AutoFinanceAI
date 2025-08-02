from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict
import math

class DefaultPagination(PageNumberPagination):
    page_size = 20
    
    def get_paginated_response(self, data):
        total_pages = math.ceil(self.page.paginator.count / self.page_size) if self.page_size else 1
        
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('total_pages', total_pages),
            ('current_page', self.page.number),
            ('page_size', self.page_size),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ]))
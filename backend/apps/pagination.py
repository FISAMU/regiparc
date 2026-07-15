"""
Helpers pagination + recherche `?q=` pour les listes API.

- apply_search_filter : filtre icontains sur une liste de champs
- get_paginated_response : page/page_size DRF-style (défaut 10)
"""
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response

DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100


def apply_search_filter(queryset, request, fields):
    query = request.query_params.get("q", "").strip()
    if not query:
        return queryset

    condition = Q()
    for field in fields:
        condition |= Q(**{f"{field}__icontains": query})

    return queryset.filter(condition)


def get_paginated_response(request, queryset, serializer_class):
    page_param = request.query_params.get("page")

    if page_param is None:
        serializer = serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    try:
        page = max(1, int(page_param))
    except (TypeError, ValueError):
        page = 1

    try:
        page_size = min(
            MAX_PAGE_SIZE,
            max(1, int(request.query_params.get("page_size", DEFAULT_PAGE_SIZE))),
        )
    except (TypeError, ValueError):
        page_size = DEFAULT_PAGE_SIZE

    total = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size

    serializer = serializer_class(queryset[start:end], many=True)

    def page_url(page_number):
        return request.build_absolute_uri(
            f"{request.path}?page={page_number}&page_size={page_size}"
        )

    return Response(
        {
            "count": total,
            "next": page_url(page + 1) if end < total else None,
            "previous": page_url(page - 1) if page > 1 else None,
            "results": serializer.data,
        },
        status=status.HTTP_200_OK,
    )

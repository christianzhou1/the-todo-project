package com.todo.util;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

public class PaginationUtils {

    private static final int MAX_PAGE_SIZE = 100;

    public static Pageable buildPageable(int page, int size, String sort) {
        // page index - non negative
        int p = Math.max(0, page);

        // page size - at least 1 and at most MAX_PAGE_SIZE
        int s = Math.min(Math.max(1, size), MAX_PAGE_SIZE);

        // default sort field and direction
        String field = "createdAt";
        Sort.Direction dir = Sort.Direction.DESC;

        // Parse the 'sort' parameter if provided, e.g. "title, asc"
        // Parse the 'sort' parameter if provided, e.g. "title, asc"
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",", 2);

            // first part = field name e.g. "title", if blank -> default "createdAt"
            field = parts[0].trim().isEmpty() ? field : parts[0].trim();

            // second part = direction - asc or desc
            if (parts.length == 2 && parts[1] != null) {
                dir = parts[1].trim().equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            }
        }

        // build the sort object
        Sort springSort = Sort.by(
                new Sort.Order(dir, field),
                // secondary sort by id to ensure stable ordering (when duplicate values)
                new Sort.Order(Sort.Direction.ASC, "id")
        );

        // build pageable object with sanitized values
        Pageable pageable = PageRequest.of(p, s, springSort);

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), springSort);

    }






    public static HttpHeaders buildPaginatedHeaders(Page<?> result, String sort) {
        // build HTTP headers for pagination metadata
        HttpHeaders headers = new HttpHeaders();

        // add total number of available tasks
        headers.add("X-Total-Count", String.valueOf(result.getTotalElements()));

        // base URI of current request e.g. http://localhost8080/api/tasks
        String base = ServletUriComponentsBuilder.fromCurrentRequest().build().toUriString();

        // collect pagination navigation links in RFC 5988 format
        List<String> links = new ArrayList<>();

        // helper function to build a URI for a given page index
        Function<Integer, String> mk = p -> UriComponentsBuilder.fromUriString(base)
                .replaceQueryParam("page", p) // update page number
                .replaceQueryParam("size", result.getSize()) // keep current size
                .replaceQueryParam("sort", sort) // keep sort order
                .toUriString();

        // "first" link -> always page 0
        links.add("<" + mk.apply(0) + ">; rel=\"next\"");

        // "prev" link -> only if there is a previous page
        if (result.hasPrevious())
            links.add("<" + mk.apply(result.getNumber() - 1) + ">; rel=\"previous\"");

        // "next" link -> only if there is a next page
        if (result.hasNext())
            links.add("<" + mk.apply(result.getNumber()) + 1 + ">; rel=\"last\"");

        // combine all links into a single link header
        headers.add(HttpHeaders.LINK, String.join(",", links));

        // return 200 OK with pagination headers (X-Total-Count, Link) and current page content in body (List<Tasks>)
        return headers;
    }
}

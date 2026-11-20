package com.umc.movie.dto;
import java.util.List;
import org.springframework.data.domain.Page;
public record RatingPageResponse(List<RatingResponse> content, int page, int size, long totalElements, int totalPages, boolean first, boolean last) {
 public static RatingPageResponse from(Page<RatingResponse> p) {
 return new RatingPageResponse(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isFirst(), p.isLast());
 }
}

package com.umc.movie.controller;

import com.umc.movie.entity.Favorite;
import com.umc.movie.entity.Member;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
// 서비스 트랜잭션의 종료 결과를 읽을 수 있도록 테스트 메서드는 트랜잭션 밖에서 실행한다.
class MovieRecordApiTest {

    private static final long MOVIE_ID = 550L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private Long memberId;

    @AfterEach
    void deleteTestData() {
        if (memberId == null) {
            return;
        }
        ratingRepository.deleteAll(ratingRepository.findByMember_MemberIdOrderByRatingIdDesc(
                memberId, PageRequest.of(0, 10)).getContent());
        favoriteRepository.deleteAll(favoriteRepository.findByMember_MemberIdOrderByFavoriteIdDesc(memberId));
        memberRepository.deleteById(memberId);
    }

    @Test
    @DisplayName("이미 즐겨찾기한 영화 기록은 409로 실패하고 평점 개수는 그대로다")
    void rollsBackRatingWhenFavoriteAlreadyExists() throws Exception {
        Member member = memberRepository.save(Member.builder()
                .email("movie-record-rollback@umc.com")
                .password("unused-test-password")
                .nickname("롤백테스트")
                .build());
        memberId = member.getMemberId();
        favoriteRepository.save(Favorite.builder().member(member).movieId(MOVIE_ID).build());
        long ratingCountBefore = ratingRepository.count();
        String token = jwtUtil.createAccessToken(memberId, member.getEmail());

        mockMvc.perform(post("/movie-records")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"movieId": 550, "score": 4, "comment": "좋았어요", "addToFavorites": true}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("FAVORITE409_1"));

        assertThat(ratingRepository.count()).as("실패 요청 전후 평점 개수").isEqualTo(ratingCountBefore);
        assertThat(ratingRepository.existsByMember_MemberIdAndMovieId(memberId, MOVIE_ID)).isFalse();
        assertThat(favoriteRepository.existsByMember_MemberIdAndMovieId(memberId, MOVIE_ID)).isTrue();
    }
}

package com.umc.movie.controller;

import com.umc.movie.entity.Member;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RatingApiTest {

    private static final long MOVIE_ID = 550L;
    private static final String REQUEST_BODY = """
            {"movieId": 550, "score": 4, "comment": "좋았어요"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    @DisplayName("토큰 없이 POST /ratings를 호출하면 401과 AUTH401_2를 응답한다")
    void rejectsRatingWithoutToken() throws Exception {
        mockMvc.perform(post("/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REQUEST_BODY))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));
    }

    @Test
    @DisplayName("토큰으로 POST /ratings를 호출하면 201과 COMMON201을 응답하고 평점을 저장한다")
    void createsRatingWithToken() throws Exception {
        Member member = memberRepository.save(Member.builder()
                .email("rating-api@umc.com")
                .password("unused-test-password")
                .nickname("평점테스트")
                .build());
        String token = jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());

        mockMvc.perform(post("/ratings")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REQUEST_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.movieId").value(550));

        assertThat(ratingRepository.existsByMember_MemberIdAndMovieId(member.getMemberId(), MOVIE_ID)).isTrue();
    }
}

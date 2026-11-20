package com.umc.movie.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.umc.movie.dto.CreateFavoriteRequest;
import com.umc.movie.entity.Favorite;
import com.umc.movie.entity.Member;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FavoriteApiTest {

    private static final long MOVIE_ID = 550L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private Member member;
    private String authorizationHeader;
    private String requestBody;

    @BeforeEach
    void setUp() throws Exception {
        member = memberRepository.save(Member.builder()
                .email("favorite-test@umc.com")
                .password("unused-test-password")
                .nickname("즐겨찾기테스트")
                .build());
        authorizationHeader = "Bearer " + jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());
        requestBody = objectMapper.writeValueAsString(new CreateFavoriteRequest(MOVIE_ID));
    }

    @Test
    @DisplayName("토큰 없이 즐겨찾기를 등록하면 401과 AUTH401_2를 응답한다")
    void createFavoriteWithoutToken() throws Exception {
        mockMvc.perform(post("/favorites")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.code").value("AUTH401_2"));
    }

    @Test
    @DisplayName("토큰으로 즐겨찾기를 등록하면 201을 응답하고 이후 조회할 수 있다")
    void createFavorite() throws Exception {
        mockMvc.perform(post("/favorites")
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.movieId").value(550));

        mockMvc.perform(get("/favorites/{movieId}", MOVIE_ID)
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.isFavorite").value(true));
    }

    @Test
    @DisplayName("이미 즐겨찾기한 영화를 다시 등록하면 409와 FAVORITE409_1을 응답한다")
    void createFavoriteWhenDuplicated() throws Exception {
        favoriteRepository.save(Favorite.builder().member(member).movieId(MOVIE_ID).build());

        mockMvc.perform(post("/favorites")
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("FAVORITE409_1"));
    }

    @Test
    @DisplayName("즐겨찾기하지 않은 영화를 조회하면 200과 isFavorite false를 응답한다")
    void getFavoriteStatus() throws Exception {
        mockMvc.perform(get("/favorites/{movieId}", MOVIE_ID)
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.isFavorite").value(false));
    }

    @Test
    @DisplayName("Swagger 문서 경로는 토큰 없이도 열려 있다")
    void apiDocsIsPublic() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/favorites'].post").exists());
    }
}

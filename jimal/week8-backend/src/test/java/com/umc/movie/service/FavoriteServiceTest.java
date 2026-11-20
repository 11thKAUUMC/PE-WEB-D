package com.umc.movie.service;

import com.umc.movie.dto.CreateFavoriteRequest;
import com.umc.movie.dto.FavoriteResponse;
import com.umc.movie.entity.Favorite;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.ApiException;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private FavoriteService favoriteService;

    private final Member member = Member.builder()
            .email("challenger@umc.com")
            .password("암호화된비밀번호")
            .nickname("영화조아")
            .build();

    @Test
    @DisplayName("아직 즐겨찾기하지 않은 영화면 해당 회원의 즐겨찾기를 저장한다")
    void createFavorite() {
        given(memberRepository.findById(1L)).willReturn(Optional.of(member));
        given(favoriteRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).willReturn(false);
        given(favoriteRepository.save(any(Favorite.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        FavoriteResponse response = favoriteService.create(1L, new CreateFavoriteRequest(550L));

        assertThat(response.movieId()).isEqualTo(550L);
        ArgumentCaptor<Favorite> savedFavorite = ArgumentCaptor.forClass(Favorite.class);
        verify(favoriteRepository).save(savedFavorite.capture());
        assertThat(savedFavorite.getValue().getMember()).isSameAs(member);
        assertThat(savedFavorite.getValue().getMovieId()).isEqualTo(550L);
    }

    @Test
    @DisplayName("이미 즐겨찾기한 영화면 FAVORITE409_1 예외를 던지고 저장하지 않는다")
    void createFavoriteWhenDuplicated() {
        given(memberRepository.findById(1L)).willReturn(Optional.of(member));
        given(favoriteRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).willReturn(true);

        assertThatExceptionOfType(ApiException.class)
                .isThrownBy(() -> favoriteService.create(1L, new CreateFavoriteRequest(550L)))
                .withMessage("이미 이 영화를 즐겨찾기하셨습니다.")
                .satisfies(exception -> {
                    assertThat(exception.getCode()).isEqualTo("FAVORITE409_1");
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                });

        verify(favoriteRepository, never()).save(any(Favorite.class));
    }
}

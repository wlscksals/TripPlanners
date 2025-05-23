package com.tripPlanner.project.domain.login.service;

import com.tripPlanner.project.domain.login.dto.LoginRequest;
import com.tripPlanner.project.domain.login.dto.LoginResponse;
import com.tripPlanner.project.domain.login.entity.UserEntity;
import com.tripPlanner.project.domain.login.entity.UserRepository;
import com.tripPlanner.project.domain.login.auth.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
//@SpringBootTest
class LoginServiceTest {


    @InjectMocks
    private LoginService loginService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

//    @Mock
//    private TokenRepository tokenRepository;

    @BeforeEach
    void setUp(){
        MockitoAnnotations.openMocks(this);
//        loginService = new LoginService(userRepository);


    }

    @Test
    @DisplayName("로그인 서비스 테스트")
    void loginServiceTest(){
        String userid = "qwer";
        String password = "1234";


        UserEntity userEntity = UserEntity.builder()
                .userid("qwer")
                .password("1234")
                .username("호날두")
                .gender('M')
                .build();
        LoginRequest loginRequest = LoginRequest.builder()
                .userid(userid)
                .password(password)
                .build();
        when(userRepository.findByUserid(loginRequest.getUserid())).thenReturn(Optional.of(userEntity));

        // When
        LoginResponse response = loginService.login(loginRequest);

        System.out.println(response);
        System.out.println(userEntity);
System.out.println(loginService);
System.out.println(userRepository);
        // Then
        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("로그인 성공", response.getMessage());
        assertEquals(userid, response.getUserid());
        verify(userRepository, times(1)).findByUserid(userid);
//        verify(jwtTokenProvider, times(1)).generateAccessToken(userid);
//        verify(jwtTokenProvider, times(1)).generateRefreshToken(userid);
//        verify(tokenRepository, times(1)).save(any(TokenEntity.class));

    }


}
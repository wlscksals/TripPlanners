package com.tripPlanner.project.commons;


import com.tripPlanner.project.domain.login.auth.jwt.JwtTokenProvider;
import com.tripPlanner.project.domain.login.dto.LoginResponse;
import com.tripPlanner.project.domain.signin.entity.UserEntity;
import com.tripPlanner.project.domain.signin.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/cookie")
@RequiredArgsConstructor
@Slf4j
public class CookieController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;


    @PostMapping("/validate")
    public ResponseEntity<LoginResponse> validateCOokie(HttpServletRequest request){
        log.info("POST /api/cookie/validate");
        
        //쿠키에서 accessToken 읽기
        String accessToken = null;
        Cookie[] cookies = request.getCookies();
        if(cookies != null){
            for(Cookie cookie : cookies){
                if("accessToken".equals(cookie.getName())){
                    accessToken = cookie.getValue();
                    break;
                }
            }
        }
        
        if(accessToken == null){
            log.warn("쿠키에 엑세스 토큰이 없습니다");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.builder()
                            .success(false)
                            .message("엑세스 토큰이 쿠키에 없습니다")
                            .build());
        }
        
        //토큰 검증
        if(!jwtTokenProvider.validateToken(accessToken)){
            log.warn("유효하지 않은 토큰입니다");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.builder()
                            .success(false)
                            .message("유효하지 않은 토큰입니다")
                            .build());
        }

        String userid = jwtTokenProvider.getUserIdFromToken(accessToken);
        Optional<UserEntity> optionalUser = userRepository.findByUserid(userid);
        
        if(optionalUser.isEmpty()){
            log.warn("유저가 존재하지 않음 {} ",userid);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.builder()
                            .success(false)
                            .message("유저 찾을 수 없음")
                            .build());
        }

        return ResponseEntity.ok(LoginResponse.builder()
                        .userid(optionalUser.get().getUserid())
                        .username(optionalUser.get().getUsername())
                        .success(true)
                        .message("유저 인증 완료")
                        .accessToken(accessToken)
                        .refreshToken(null)

                .build());
        
    }


}

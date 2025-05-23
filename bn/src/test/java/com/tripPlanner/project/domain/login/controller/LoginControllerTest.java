//package com.tripPlanner.project.domain.login.controller;
//
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.tripPlanner.project.domain.login.dto.LoginRequest;
//import com.tripPlanner.project.domain.login.dto.LoginResponse;
//import com.tripPlanner.project.domain.login.entity.TokenRepository;
//import com.tripPlanner.project.domain.login.entity.UserRepository;
//import com.tripPlanner.project.domain.login.service.LoginService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.Mockito;
//import org.mockito.MockitoAnnotations;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.setup.MockMvcBuilders;
//
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//
//@SpringBootTest
//@AutoConfigureMockMvc
//@ExtendWith(MockitoExtension.class)
//public class LoginControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private LoginController loginController;
//
//    @Mock
//    private LoginService loginService;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private TokenRepository tokenRepository;
//
//
////    AutoCloseable openMocks;
//
//    ObjectMapper objectMapper = new ObjectMapper();
//
//    @BeforeEach
//    public void setUp() {
//        MockitoAnnotations.openMocks(this);
//        loginController = new LoginController(loginService);
//        mockMvc = MockMvcBuilders.standaloneSetup(loginController).build();
//
//    }
//
//    @Test
//    @DisplayName(("로그인 성공 테스트"))
//    public void loginTest() throws Exception {
//
//         System.out.println("mockMvc" +mockMvc);
//        //given
//        String userid = "qwer";
//        String password = "1234";
//
//        LoginRequest loginRequest = LoginRequest.builder()
//                .userid(userid)
//                .password(password)
//                .build();
//
//        LoginResponse loginResponse = LoginResponse.builder()
//                .userid(userid)
//                .username("qwer")
//                .success(true)
//                .message("로그인 성공")
//                .build();
//
//        Mockito.when(loginService.login(Mockito.any(LoginRequest.class))).thenReturn(loginResponse);
//
//        mockMvc.perform(post("/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(loginRequest)))
//                .andDo(print())
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.success").value(true))
//                .andExpect(jsonPath("$.message").value("로그인 성공"));
//
//        Mockito.verify(loginService, Mockito.times(1)).login(Mockito.any(LoginRequest.class));
//    }
//
//    @Test
//    @DisplayName("로그인 실패 테스트")
//    public void loginFailureTest() throws Exception {
//        //given
//        String userid = "user1231";
//        String password = "12324";
//
//        LoginRequest loginRequest = LoginRequest.builder()
//                .userid(userid)
//                .password(password)
//                .build();
//
//        LoginResponse loginResponse = LoginResponse.builder()
//                .userid(userid)
//                .username(userid)
//                .success(false)
//                .message("로그인 실패")
//                .build();
//        Mockito.when(loginService.login(Mockito.any(LoginRequest.class))).thenReturn(loginResponse);
//
//        // when & then
//        mockMvc.perform(post("/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(loginRequest)))
//                .andDo(print())
//                .andExpect(status().isBadRequest())
//                .andExpect(jsonPath("$.success").value(false))
//                .andExpect(jsonPath("$.message").value("Invalid credentials"));
//    }
//
//
//}
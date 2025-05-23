package com.tripPlanner.project.domain.login.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // 외부 DB 사용
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("유저 DB 테스트")
    public void userDBTest(){
        //given
        UserEntity userEntity = UserEntity.builder()
                .userid("user1")
                .username("박대해")
                .email("qkreogo1@naver.com")
                .password("1234")
                .addr("창녕군 창녕읍")
                .build();

        UserEntity user = userRepository.save(userEntity);

        //when
        Optional<UserEntity> findUser = userRepository.findByUserid(user.getUserid());

        //then
        assertTrue(findUser.isPresent());
        assertEquals(user.getUserid(),findUser.get().getUserid());
        assertEquals(user.getPassword(),findUser.get().getPassword());
//        Assertions.assertEquals(user.getUserid(),findUser.getUserid());
        System.out.println(user.toString());
    }



}
package com.quickfolds.backend.origami.service;


import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.mapper.StepTypeMapper;
import com.quickfolds.backend.origami.mapper.OrigamiMapper;
import com.quickfolds.backend.origami.model.dto.request.NewOrigamiRequest;
import com.quickfolds.backend.origami.model.dto.response.OrigamiListResponse;
import com.quickfolds.backend.origami.model.dto.response.OrigamiResponse;
import com.quickfolds.backend.user.mapper.UserMapper;
import com.quickfolds.backend.user.model.User;
import com.quickfolds.backend.user.service.UserService;
import lombok.Data;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Data
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest
@ActiveProfiles(value = "${SPRING_PROFILES_ACTIVE}")
@Transactional
public class OrigamiServiceTest {

    private static final int NUM_TRIALS = 200;

    /**
     * Service under test for user-related operations.
     */
    @Autowired
    private UserService userService;

    /**
     * Service under test for origami-related operations.
     */
    @Autowired
    private OrigamiService origamiService;

    /**
     * UserMapper for database operations.
     */
    @Autowired
    private UserMapper userMapper;


    private List<Long> prepData() {
        List<Long> userIds = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            // Create a new user
            String userName = "user" + i;
            User user = new User();
            user.setUsername(userName);
            user.setPassword("password" + i);

            // Register user and verify success
            userMapper.insertUser(user);
            userIds.add(userMapper.getIdByUsername(userName));
        }

        return userIds;
    }

    private void insertOrigami(Long userId, String origamiName, boolean isPublic) {
        NewOrigamiRequest request = new NewOrigamiRequest();
        request.setUserId(userId);
        request.setOrigamiName(origamiName);
        request.setIsPublic(isPublic);

        origamiService.newOrigami(request);
    }


    @Test
    public void testListAllPublic() throws Exception {
        List<Long> userIds = prepData();

        for (int i = 0; i < NUM_TRIALS; i++) {
            insertOrigami(userIds.get(i % userIds.size()), "origami" + i, true);

            ResponseEntity<BaseResponse<OrigamiListResponse>> response = origamiService.list();

            // Assert the status code
            assertEquals(200, response.getStatusCode().value());

            // Assert the body exists
            BaseResponse<OrigamiListResponse> responseBody = response.getBody();
            assertNotNull(responseBody, "Response body should not be null");

            // Assert BaseResponse fields
            assertTrue(responseBody.isStatus(), "Status should be true");
            assertEquals(200, responseBody.getStatusCode());
            assertEquals("success", responseBody.getMessage());

            // Assert OrigamiListResponse fields
            OrigamiListResponse origamiList = responseBody.getData();
            assertNotNull(origamiList, "Origami list should not be null");
            assertEquals(origamiList.getOrigamis().size(), i + 1,
                    "Origami list have different number of elements, " +
                             "expected: " + (i + 1) + " actual: " + "origamiList.getOrigamis().size()");

            int index = i;
            OrigamiResponse origami = origamiList.getOrigamis()
                    .stream()
                    .filter(o -> o.getOrigamiName().equals("origami" + index))
                    .findFirst()
                    .orElseThrow(() -> new AssertionError("Origami not found for name: origami" + index));

            assertEquals("user" + (i % userIds.size()), origami.getAuthor());
            assertEquals("origami" + i, origami.getOrigamiName());
        }
    }
}

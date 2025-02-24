package com.quickfolds.backend.origami.service;


import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.mapper.StepTypeMapper;
import com.quickfolds.backend.origami.mapper.OrigamiMapper;
import com.quickfolds.backend.origami.model.dto.request.NewOrigamiRequest;
import com.quickfolds.backend.origami.model.dto.response.OrigamiListResponse;
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


    private void prepData() {
        for (int i = 0; i < 5; i++) {
            // Create a new user
            User user = new User();
            user.setUsername("user" + i);
            user.setPassword("password" + i);

            // Register user and verify success
            boolean result = userService.registerUser(user);
            assertTrue(result, "User should be registered successfully");
        }

        // TODO: Write SQL to insert steps
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
        prepData();

        for (int i = 0; i < NUM_TRIALS; i++) {
            insertOrigami((long) i % 5 + 1, "origami" + i, true);

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
            assertEquals(origamiList.getOrigamis().size(), i + 1, "Origami list have different number of elements, " +
                    "expected: " + (i + 1) + " actual: " + "origamiList.getOrigamis().size()");

            assertEquals("user" + (i % 5), origamiList.getOrigamis().get(i).getAuthor());
            assertEquals("origami" + i, origamiList.getOrigamis().get(i).getOrigamiName());
        }
    }
}

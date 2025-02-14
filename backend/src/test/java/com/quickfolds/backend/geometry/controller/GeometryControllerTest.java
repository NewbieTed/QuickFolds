package com.quickfolds.backend.geometry.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.model.dto.*;
import com.quickfolds.backend.geometry.service.GeometryService;
import com.quickfolds.backend.user.auth.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = GeometryController.class)
@AutoConfigureMockMvc(addFilters = false)
public class GeometryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private GeometryService geometryService;

    private final ObjectMapper objectMapper = new ObjectMapper();


    public static AnnotationRequest createAnnotationRequest(Long origamiId, Integer stepIdInOrigami,
                                                            List<PointAnnotationRequest> points,
                                                            List<LineAnnotationRequest> lines,
                                                            List<Integer> deletedPoints,
                                                            List<Integer> deletedLines) {
        Annotation annotation = new Annotation(points, lines, deletedPoints, deletedLines);
        FaceAnnotateRequest face = new FaceAnnotateRequest(5, annotation);
        return new AnnotationRequest(origamiId, stepIdInOrigami, Collections.singletonList(face));
    }


    @Test
    public void handlesValidAnnotateRequest() throws Exception {

        Mockito.when(geometryService.annotate(Mockito.any(AnnotationRequest.class)))
                .thenReturn(BaseResponse.success(true));

        List<PointAnnotationRequest> points = new ArrayList<>();
        List<LineAnnotationRequest> lines = new ArrayList<>();
        List<Integer> deletedPoints = new ArrayList<>();
        List<Integer> deletedLines = new ArrayList<>();

        for (int i = 1; i < 4; i++) {
            points.add(new PointAnnotationRequest(i, 1.0 * i, 1.0 * i, null));
            lines.add(new LineAnnotationRequest(i, i, i + 1));
            deletedPoints.add(2 * i);
            deletedLines.add(2 * i);
        }

        // Use factory method to create the request
        AnnotationRequest request = createAnnotationRequest(
                1L,
                2,
                points,
                lines,
                deletedPoints,
                deletedLines
        );

        String requestBody = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/geometry/annotate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }


    @Test
    public void handlesInvalidAnnotateRequest_MissingOrigamiId() throws Exception {
        List<PointAnnotationRequest> points = new ArrayList<>();
        List<LineAnnotationRequest> lines = new ArrayList<>();
        List<Integer> deletedPoints = new ArrayList<>();
        List<Integer> deletedLines = new ArrayList<>();

        for (int i = 1; i < 4; i++) {
            points.add(new PointAnnotationRequest(i, 1.0 * i, 1.0 * i, null));
            lines.add(new LineAnnotationRequest(i, i, i + 1));
            deletedPoints.add(2 * i);
            deletedLines.add(2 * i);
        }

        // Use factory method to create the request
        AnnotationRequest invalidRequest = createAnnotationRequest(
                null,
                2,
                points,
                lines,
                deletedPoints,
                deletedLines
        );

        String requestBody = objectMapper.writeValueAsString(invalidRequest);

        mockMvc.perform(post("/geometry/annotate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    // Uncommented tests can be used as needed
    // @Test
    // public void handlesInvalidAnnotateRequest_MissingStepIdInOrigami() throws Exception {
    //     String invalidRequest = """
    //         {
    //             "origamiId": 1
    //         }
    //         """;
    //
    //     mockMvc.perform(post("/geometry/annotate")
    //                     .contentType(MediaType.APPLICATION_JSON)
    //                     .content(invalidRequest))
    //             .andExpect(status().isBadRequest())
    //             .andExpect(jsonPath("$.message").value("Field 'stepIdInOrigami' in Annotate must not be null"));
    // }

    // @Test
    // public void handlesEmptyRequest() throws Exception {
    //     String emptyRequest = "{}";
    //
    //     mockMvc.perform(post("/geometry/annotate")
    //                     .contentType(MediaType.APPLICATION_JSON)
    //                     .content(emptyRequest))
    //             .andExpect(status().isBadRequest())
    //             .andExpect(jsonPath("$.message").value("Field 'origamiId' in Annotate must not be null"));
    // }
}
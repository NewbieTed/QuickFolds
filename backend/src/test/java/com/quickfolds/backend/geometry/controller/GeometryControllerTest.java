package com.quickfolds.backend.geometry.controller;

import com.quickfolds.backend.config.exception.GlobalExceptionHandler;
import com.quickfolds.backend.geometry.model.dto.AnnotationRequest;
import com.quickfolds.backend.geometry.service.GeometryService;
import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.user.auth.JwtAuthenticationFilter;
import com.quickfolds.backend.user.auth.JwtUtil;
import com.quickfolds.backend.user.auth.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = GeometryController.class)
@Import({TestSecurityConfig.class, GlobalExceptionHandler.class})
@AutoConfigureMockMvc(addFilters = true)
public class GeometryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private GeometryService geometryService;



    @Test
    public void handlesValidAnnotateRequest() throws Exception {
        // Generate a mock CSRF token
        HttpSessionCsrfTokenRepository csrfTokenRepository = new HttpSessionCsrfTokenRepository();
        CsrfToken csrfToken = csrfTokenRepository.generateToken(null);

        Mockito.when(geometryService.annotate(Mockito.any(AnnotationRequest.class)))
                .thenReturn(BaseResponse.success(true));

        String requestBody = """
            {
                "origamiId": 1,
                "stepIdInOrigami": 2,
                "faces": [
                    {
                        "idInOrigami": 5,
                        "annotations": {
                            "points": [
                                {
                                    "idInFace": 2,
                                    "x": 1.0,
                                    "y": 2.0,
                                    "onEdgeIdInFace": null
                                }
                            ],
                            "lines": [
                                {
                                    "idInFace": 1,
                                    "point1IdInOrigami": 3,
                                    "point2IdInOrigami": 5
                                }
                            ],
                            "deletedPoints": [2, 7, 8],
                            "deletedLines": [1, 3, 5]
                        }
                    }
                ]
            }
            """;

        mockMvc.perform(post("/geometry/annotate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .header(csrfToken.getHeaderName(), csrfToken.getToken())) // Add the CSRF token
                .andExpect(status().isOk());
    }

//    @Test
//    public void handlesInvalidAnnotateRequest_MissingOrigamiId() throws Exception {
//        HttpSessionCsrfTokenRepository csrfTokenRepository = new HttpSessionCsrfTokenRepository();
//        CsrfToken csrfToken = csrfTokenRepository.generateToken(null);
//
//        Mockito.when(geometryService.annotate(Mockito.any(AnnotationRequest.class)))
//                .thenReturn(BaseResponse.success(true));
//
//        String invalidRequest = """
//                {
//                      "stepIdInOrigami": 2,
//                      "faces": [
//                          {
//                              "idInOrigami": 5,
//                              "annotations": {
//                                  "points": [
//                                      {
//                                          "idInFace": 2,
//                                          "x": 1.0,
//                                          "y": 2.0,
//                                          "onEdgeIdInFace": null
//                                      },
//                                      {
//                                          "idInFace": 3,
//                                          "x": 0.5,
//                                          "y": 3.0,
//                                          "onEdgeIdInFace": 4
//                                      }
//                                  ],
//                                  "lines": [
//                                      {
//                                          "idInFace": 1,
//                                          "point1IdInOrigami": 3,
//                                          "point2IdInOrigami": 5
//                                      },
//                                      {
//                                          "idInFace": 2,
//                                          "point1IdInOrigami": 1,
//                                          "point2IdInOrigami": 4
//                                      }
//                                  ],
//                                  "deletedPoints": [
//                                      2,
//                                      7,
//                                      8
//                                  ],
//                                  "deletedLines": [
//                                      1,
//                                      3,
//                                      5
//                                  ]
//                              }
//                          }
//                      ]
//                  }
//                """;
//
//        mockMvc.perform(post("/geometry/annotate")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .header(csrfToken.getHeaderName(), csrfToken.getToken())
//                        .content(invalidRequest))
//                .andExpect(status().isBadRequest());
//    }

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
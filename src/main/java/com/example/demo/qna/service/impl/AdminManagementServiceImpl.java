package com.example.demo.qna.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.qna.dto.QuestionCategoryDTO;
import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.entity.QuestionEntity;
import com.example.demo.qna.repository.QuestionRepository;
import com.example.demo.qna.service.AdminManagementService;
import com.example.demo.qna.repository.QuestionCategoryRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Objects;

@Service
public class AdminManagementServiceImpl implements AdminManagementService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionCategoryRepository questionCategoryRepository;

    @Override
    public void addFAQ(QuestionDTO questionDTO) {
        QuestionEntity questionEntity = new QuestionEntity();
        questionEntity.setTitle(questionDTO.getTitle());
        questionEntity.setContent(questionDTO.getContent());
        questionEntity.setCategoryEntity(questionCategoryRepository.findById(questionDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("카테고리가 존재하지 않습니다.")));
        questionRepository.save(questionEntity);
    }

    @Override
    public List<QuestionDTO> getAllQuestions() {
        try {
            List<QuestionEntity> entities = questionRepository.findAll();
            if (entities.isEmpty()) {
                System.out.println("No questions found in database");
                return new ArrayList<>();
            }
            return entities.stream()
                .map(entity -> {
                    try {
                        return QuestionDTO.toGetQuestionDTO(entity);
                    } catch (Exception e) {
                        System.out.println("Error mapping entity: " + entity.getId() + ", Error: " + e.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("Error fetching questions: " + e.getMessage());
            throw new RuntimeException("Failed to fetch questions", e);
        }
    }


    @Override
    public List<QuestionDTO> getAllQuestionsIncludingSecret() {
        return questionRepository.findAll().stream()
                .map(question -> new QuestionDTO(
                        question.getId(),
                        question.getCategoryEntity().getId(),
                        question.getUserEntity().getId(),
                        question.getTitle(),
                        question.getContent(),
                        question.getQuestionDate(),
                        question.getResponse(),
                        question.getResponseDate(),
                        question.getSecret(),
                        question.getFixQuestion()
                ))
                .collect(Collectors.toList());
    }


    @Override
    public void respondToQuestion(Integer questionId, String response) {
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        
        question.setResponse(response);
        question.setResponseDate(LocalDateTime.now());
        questionRepository.save(question);
    }

    @Override
    public void updateResponse(Integer questionId, String response) {
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        
        question.setResponse(response);
        question.setResponseDate(LocalDateTime.now()); 
        questionRepository.save(question);
    }

    @Override
    public void deleteResponse(Integer questionId) {
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        
        question.setResponse(null);
        question.setResponseDate(null);
        questionRepository.save(question);
    }

    @Override
    public List<QuestionCategoryDTO> getAllCategories() {
        return questionCategoryRepository.findAll().stream()
                .map(category -> new QuestionCategoryDTO(category.getId(), category.getName().toString()))
                .collect(Collectors.toList());
    }

}
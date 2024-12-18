package com.example.demo.qna.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.qna.dto.QuestionDTO;
import com.example.demo.qna.entity.QuestionEntity;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, Integer> {

    // 모든 문의 조회
    @Query("SELECT q FROM QuestionEntity q ORDER BY q.questionDate DESC")
    @Override
    public List<QuestionEntity> findAll();

    // 문의 답변 등록
    @Modifying
    @Query("UPDATE QuestionEntity q SET q.response = :response, q.responseDate = :responseDate WHERE q.id = :id")
    @Transactional
    public int saveResponse(
            @Param("id") Integer id,
            @Param("response") String response,
            @Param("responseDate") LocalDateTime responseDate
    );

    // 선택한 문의 답변 조회
    @Query("SELECT q FROM QuestionEntity q WHERE q.id = :id")
    public Optional<QuestionEntity> findResponseById(@Param("id") Integer id);

    // 문의 답변 수정
    @Modifying
    @Query("UPDATE QuestionEntity q SET q.response = :response, q.responseDate = :responseDate WHERE q.id = :id")
    @Transactional
    public void updateResponse(
            @Param("id") Integer id,
            @Param("response") String response,
            @Param("responseDate") LocalDateTime responseDate
    );

    // 문의 답변 삭제
    @Modifying
    @Query("UPDATE QuestionEntity q SET q.response = NULL, q.responseDate = NULL WHERE q.id = :id")
    @Transactional
    public void deleteResponse(@Param("id") Integer id);

    // 문의 삭제
    public void deleteById(Integer id);

    // 답변 상태로 문의 조회
    @Query("SELECT q FROM QuestionEntity q WHERE q.response IS NOT NULL")
    public List<QuestionEntity> findAllWithResponse();

    // 미답변 상태 문의 조회
    @Query("SELECT q FROM QuestionEntity q WHERE q.response IS NULL")
    public List<QuestionEntity> findAllWithoutResponse();

    // 24.12.13 - yjy
    // 미답변 문의 수 조회
    public int countByResponseIsNull();

    // 24.12.13 - yjy
    // 답변 완료 문의 수 조회
    public int countByResponseIsNotNull();

    // FAQ 목록 조회 (fixQuestion이 true인 것만 최신순으로)
    @Query("SELECT q FROM QuestionEntity q WHERE q.fixQuestion = true ORDER BY q.questionDate DESC")
    List<QuestionEntity> findByFixQuestionTrueOrderByQuestionDateDesc();

    //문의리스트 전체검색 fixquestion이 false 것만
    @Query("SELECT q FROM QuestionEntity q WHERE q.fixQuestion=false ")
    Page<QuestionEntity> findAllByFixquestion(Pageable pageable);

    // 문의리스트 제목만 검색
    @Query("SELECT q FROM QuestionEntity q WHERE q.fixQuestion=false  AND LOWER(q.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    public Page<QuestionEntity> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // 문의리스트 문의 카테고리만 검색
    @Query("SELECT q FROM QuestionEntity q WHERE q.fixQuestion=false AND q.categoryEntity.id=:categoryid")
    Page<QuestionEntity> findByCategoryEntityId(int categoryid, Pageable pageable);

    // 문의리스트 제목, 카테고리 검색
    @Query("SELECT q FROM QuestionEntity q WHERE q.fixQuestion = false AND LOWER(q.title) LIKE LOWER(CONCAT('%', :title, '%')) AND q.categoryEntity.id = :categoryid")
    Page<QuestionEntity> findByTitleContainingIgnoreCaseAndCategoryEntityId(String title, int categoryid, Pageable pageable);


    // 문의리스트 비밀글 조회
    @Query("SELECT q FROM QuestionEntity q WHERE q.id=:id")
    QuestionEntity findQuestionById(@Param("id") int id);
//
//    @Query("SELECT q FROM QuestionEntity q WHERE q.secret IS FALSE")
//    Page<QuestionEntity> findBySecret(Pageable pageable);
    // 마이페이지 나의 문의 리스트 조회 - 강민 12/18 11:06
    public List<QuestionEntity> findByUserEntity_Id(Integer userId);
}
package com.example.demo.user.service;

import java.util.List;

import com.example.demo.user.dto.WishDTO;

public interface WishService {

    public void addProduct(int productId, int userId);

    public List<WishDTO> printWish(int userId);

    public void deleteProduct(int productId, int userId);

}
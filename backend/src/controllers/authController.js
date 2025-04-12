const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { measureDbQuery } = require('../utils/metrics');
const serverConfig = require('../config/server');

// 사용자 로그인
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // 사용자 조회
    const user = await measureDbQuery(
      'findOne',
      'users',
      () => User.findOne({
        where: { username }
      })
    );
    
    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 사용자 이름 또는 비밀번호입니다.' });
    }
    
    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: '유효하지 않은 사용자 이름 또는 비밀번호입니다.' });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        isAdmin: user.is_admin 
      }, 
      serverConfig.jwt.secret, 
      { expiresIn: serverConfig.jwt.expiresIn }
    );
    
    // 응답
    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    next(error);
  }
};

// 현재 사용자 정보 조회
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await measureDbQuery(
      'findByPk',
      'users',
      () => User.findByPk(userId, {
        attributes: ['id', 'username', 'name', 'email', 'is_admin']
      })
    );
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin
    });
  } catch (error) {
    next(error);
  }
};

// 회원가입 (개발 환경에서만 사용)
exports.register = async (req, res, next) => {
  // 개발 환경에서만 회원가입 허용
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: '회원가입이 비활성화되었습니다.' });
  }
  
  try {
    const { username, password, name, email, isAdmin } = req.body;
    
    // 사용자 이름 중복 확인
    const existingUser = await measureDbQuery(
      'findOne',
      'users',
      () => User.findOne({
        where: { username }
      })
    );
    
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 사용자 이름입니다.' });
    }
    
    // 이메일 중복 확인
    if (email) {
      const existingEmail = await measureDbQuery(
        'findOne',
        'users',
        () => User.findOne({
          where: { email }
        })
      );
      
      if (existingEmail) {
        return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
      }
    }
    
    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 사용자 생성
    const newUser = await measureDbQuery(
      'create',
      'users',
      () => User.create({
        username,
        password: hashedPassword,
        name,
        email,
        is_admin: isAdmin || false
      })
    );
    
    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.is_admin
      }
    });
  } catch (error) {
    next(error);
  }
};
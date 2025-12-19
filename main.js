//获取胶片元素
const img = document.querySelector('.img');
//胶片初始状态：静止
img.style.animationPlayState = 'paused';
//获取播放按钮
const btnbegin = document.getElementsByClassName('iconfont icon-bofang1')[0];
//获取所有的音频元素
const audios = [
    document.querySelector('.audio1'),
    document.querySelector('.audio2'),
    document.querySelector('.audio3')
];
let currentIndex = 0;//当前播放的音频索引
let currentAudio = audios[currentIndex];//当前播放的音频元素



//====================1、播放和暂停功能，同时实现控制唱片旋转的效果====================
btnbegin.addEventListener('click', function () {
    if (this.classList.contains('icon-bofang1')) {
        img.style.animationPlayState = 'running';
        this.className = 'iconfont icon-zanting';
        currentAudio.play();
    } else {
        img.style.animationPlayState = 'paused';
        this.className = 'iconfont icon-bofang1';
        currentAudio.pause();
    }
});



//====================2、进度条随着音乐更新 和 时间显示实时变化====================
const progressPlayed = document.getElementsByClassName('progress-played')[0];//进度条已播放部分
const progressDot = document.getElementsByClassName('progress-dot')[0];//进度条圆点
const currentTime = document.getElementsByClassName('current-time')[0];//当前时间
const totalTime = document.getElementsByClassName('total-time')[0];//总时间

// 歌曲进度条和时间更新函数
function updateProgressAndTime() {
    // 防止audio.duration为NaN（音频未加载完成时）
    if (currentAudio.duration && !isNaN(currentAudio.duration)) {
        // 更新进度条
        const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressPlayed.style.width = percent + '%';
        progressDot.style.left = percent + '%';

        // 更新时间显示
        let currentMinutes = Math.floor(currentAudio.currentTime / 60);
        let currentSeconds = Math.floor(currentAudio.currentTime - currentMinutes * 60);
        let totalMinutes = Math.floor(currentAudio.duration / 60);
        let totalSeconds = Math.floor(currentAudio.duration - totalMinutes * 60);

        // 补零
        if (currentSeconds < 10) currentSeconds = '0' + currentSeconds;
        if (totalSeconds < 10) totalSeconds = '0' + totalSeconds;
        if (currentMinutes < 10) currentMinutes = '0' + currentMinutes;
        if (totalMinutes < 10) totalMinutes = '0' + totalMinutes;

        currentTime.textContent = currentMinutes + ':' + currentSeconds;
        totalTime.textContent = totalMinutes + ':' + totalSeconds;
    }
}
currentAudio.addEventListener('timeupdate', updateProgressAndTime);



//====================3、上一曲、下一曲功能====================
//切换歌曲的函数
function switchToAudio(index) {
    // ①歌曲索引要在有效范围内
    if (index < 0 || index >= audios.length) return;
    // ②记录状态并停止当前
    const wasPlaying = !currentAudio.paused;
    currentAudio.pause();
    currentAudio.currentTime = 0;

    // ③移除旧歌曲的事件监听
    currentAudio.removeEventListener('timeupdate', updateProgressAndTime);
    currentAudio.removeEventListener('ended', handleSongEnded);

    // ④更新当前歌曲索引和引用
    currentIndex = index;
    currentAudio = audios[index];

    // ⑤给新歌曲绑定事件监听
    currentAudio.addEventListener('timeupdate', updateProgressAndTime);
    currentAudio.addEventListener('ended', handleSongEnded);
    currentAudio.volume = currentVolume;
    currentAudio.playbackRate = playbackRates[currentRateIndex];

    // ⑥更新歌曲信息显示
    const songTitle = document.querySelector('.right h1');
    const songArtist = document.querySelector('.right span');
    const songNames = ['歌曲1', '歌曲2', '歌曲3'];
    const artists = ['翁颖颖1', '翁颖颖2', '翁颖颖3'];
    songTitle.textContent = songNames[index];
    songArtist.textContent = `作者：${artists[index]}`;
    const bgImages = ['bg1.png', 'bg2.png', 'bg3.png'];
    document.body.style.backgroundImage = `url(img/${bgImages[index]})`;
    const discImages = ['bg1.png', 'bg2.png', 'bg3.png'];
    const discElement = document.querySelector('.img');
    discElement.style.backgroundImage = `url(img/${discImages[index]})`;

    // ⑦重置界面显示
    progressPlayed.style.width = '0%';
    progressDot.style.left = '0%';
    currentTime.textContent = '00:00';
    totalTime.textContent = '00:00';

    // ⑧如果之前是播放状态，自动播放新歌曲
    if (wasPlaying) {
        currentAudio.play();
        img.style.animationPlayState = 'running';
        btnbegin.className = 'iconfont icon-zanting';
    }

    console.log('已切换到：歌曲' + (index + 1));

    //切换歌曲时关闭MV
    syncMvWithSongSwitch();
}

//实现切换上一曲和下一曲功能部分
const previous = document.querySelector('.icon-icon_shangyishou');
const next = document.querySelector('.icon-icon_xiayishou');

// 上一曲按钮
previous.addEventListener('click', function () {
    // 计算上一首的索引
    let newIndex = currentIndex - 1;
    //如果是第一首，就跳到最后一首
    if (newIndex < 0) {
        newIndex = audios.length - 1; // 跳到最后一首
    }
    // 调用切换函数
    switchToAudio(newIndex);
});

// 下一曲按钮
next.addEventListener('click', function () {
    // 计算下一首的索引
    let newIndex = currentIndex + 1;
    //如果是最后一首，就跳到第一首
    if (newIndex >= audios.length) {
        newIndex = 0; // 跳回第一首
    }
    // 调用切换函数
    switchToAudio(newIndex);
});



//====================4、歌曲合集选择功能====================
const playlistBtn = document.querySelector('.icon-bofangheji');
const playlistModal = document.querySelector('.playlist-modal');
const closeModalBtn = document.querySelector('.close-modal');
const songItems = document.querySelectorAll('.song-item');
// 点击歌单按钮显示弹窗
playlistBtn.addEventListener('click', function () {
    playlistModal.style.display = 'flex';
});
// 点击关闭按钮隐藏弹窗
closeModalBtn.addEventListener('click', function () {
    playlistModal.style.display = 'none';
});
// 点击弹窗背景也可以关闭
playlistModal.addEventListener('click', function (e) {
    if (e.target === playlistModal) {
        playlistModal.style.display = 'none';
    }
});
// 点击歌曲项切换歌曲
songItems.forEach(item => {
    item.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'));
        switchToAudio(index);
        playlistModal.style.display = 'none'; // 切换后自动关闭弹窗
        // 添加视觉反馈
        this.style.background = 'rgba(255, 255, 255, 0.2)';
        setTimeout(() => {
            this.style.background = '';
        }, 300);
    });
});



//====================5、音量控制====================
const volumeIcon = document.querySelector('.icon-shengyin');
const volumeProgressBg = document.querySelector('.volume-progress-bg');
const volumeProgressPlayed = document.querySelector('.volume-progress-played');
const volumeProgressDot = document.querySelector('.volume-progress-dot');
// 设置初始音量（60%）
let currentVolume = 0.6;
currentAudio.volume = currentVolume;

// 初始化音量条显示
function initVolumeDisplay() {
    const percent = currentVolume * 100;
    volumeProgressPlayed.style.width = percent + '%';
    volumeProgressDot.style.left = percent + '%';
}

// 页面加载时初始化
initVolumeDisplay();
// 点击音量条设置音量
volumeProgressBg.addEventListener('click', function (e) {
    // 计算点击位置相对于音量条的百分比
    const rect = this.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1); // 限制在0-1之间

    // 更新音量
    currentVolume = percent;
    currentAudio.volume = percent;

    // 更新显示
    updateVolumeDisplay(percent * 100);

    console.log('音量设置为：', Math.round(percent * 100) + '%');
});

// 更新音量显示的函数
function updateVolumeDisplay(percent) {
    volumeProgressPlayed.style.width = percent + '%';
    volumeProgressDot.style.left = percent + '%';
}
// 记录静音前的音量
let mutePreviousVolume = currentVolume;

// 音量图标点击事件
volumeIcon.addEventListener('click', function () {
    if (currentAudio.volume > 0) {
        // 保存当前音量，然后静音
        mutePreviousVolume = currentAudio.volume;
        currentAudio.volume = 0;
        currentVolume = 0;

        // 更新图标
        this.classList.remove('icon-shengyin');
        this.classList.add('icon-jingyin');

        updateVolumeDisplay(0);
        console.log('静音');
    } else {
        // 恢复之前音量
        currentAudio.volume = mutePreviousVolume;
        currentVolume = mutePreviousVolume;

        // 恢复图标
        this.classList.remove('icon-jingyin');
        this.classList.add('icon-shengyin');

        updateVolumeDisplay(mutePreviousVolume * 100);
        console.log('恢复音量：', Math.round(mutePreviousVolume * 100) + '%');
    }
});



//==========6、倍速播放功能==========
// 获取倍速控制元素
const playbackRateBtn = document.querySelector('.playback-rate');
// 倍速选项
const playbackRates = [1.00, 1.25, 1.5, 2.0, 3.0, 5.0];
let currentRateIndex = 0; // 当前倍速索引
// 切换倍速的函数
function togglePlaybackRate() {
    // 循环到下一个倍速
    currentRateIndex = (currentRateIndex + 1) % playbackRates.length;
    const newRate = playbackRates[currentRateIndex];

    // 应用到所有音频元素（切换歌曲时倍速不变）
    audios.forEach(audio => {
        audio.playbackRate = newRate;
    });

    // 更新按钮显示
    playbackRateBtn.textContent = newRate.toFixed(2) + 'x';

    // 更新data-rate属性
    playbackRateBtn.setAttribute('data-rate', newRate);

    console.log('播放速度：', newRate + 'x');
}
// 倍速按钮点击事件
playbackRateBtn.addEventListener('click', togglePlaybackRate);



//==========7、循环播放、顺序播放功能==========
const loopBtn = document.querySelector('.icon-_danqubofangyici');
const LOOP_MODES = {
    LIST: 'list',       // 列表循环
    SINGLE: 'single'    // 单曲循环
};
let currentLoopMode = LOOP_MODES.LIST; // 初始：列表循环

// 切换模式
loopBtn.addEventListener('click', function () {
    if (currentLoopMode === LOOP_MODES.LIST) {
        // 切换到单曲循环
        currentLoopMode = LOOP_MODES.SINGLE;
        this.className = 'iconfont icon-_danqubofangyici'; // 保持原图标
        this.title = '单曲循环';
        console.log('切换到：单曲循环');
    } else {
        // 切换回列表循环
        currentLoopMode = LOOP_MODES.LIST;
        this.className = 'iconfont icon-xunhuan'; // 切换图标
        this.title = '列表循环';
        console.log('切换到：列表循环');
    }
});

// 初始设置
loopBtn.title = '列表循环';
loopBtn.className = 'iconfont icon-xunhuan';
// 歌曲结束处理函数
function handleSongEnded() {
    console.log('歌曲播放结束，当前模式：', currentLoopMode);

    if (currentLoopMode === LOOP_MODES.LIST) {
        // 列表循环：播放下一首
        const nextIndex = (currentIndex + 1) % audios.length;
        console.log('列表循环：切换到下一首，索引', nextIndex);
        switchToAudio(nextIndex);
        setTimeout(() => {
            currentAudio.play();
        }, 300);
    } else {
        // 单曲循环：重新播放当前歌曲
        console.log('单曲循环：重新播放当前歌曲');
        currentAudio.currentTime = 0; // 重置到开头
        setTimeout(() => {
            currentAudio.play();
        }, 300);
    }
}
// 初始绑定
currentAudio.addEventListener('ended', handleSongEnded);

//====================8、MV播放功能====================
// 获取MV相关元素
const mvBtn = document.querySelector('.mv-icon'); // MV按钮
const mvModal = document.querySelector('.mv-modal'); // MV弹窗
const closeMvBtn = document.querySelector('.close-mv'); // 关闭MV按钮
const mvPlayer = document.querySelector('.mv-player'); // MV播放器

// MV视频地址映射
const mvSources = [
    'video/video0.mp4', // 歌曲1对应的MV
    'video/video1.mp4', // 歌曲2对应的MV
    'video/video2.mp4'  // 歌曲3对应的MV
];

// 播放当前歌曲对应的MV
function playCurrentMv() {
    // 1. 暂停音频播放，重置播放按钮和唱片状态
    currentAudio.pause();
    btnbegin.className = 'iconfont icon-bofang1';
    img.style.animationPlayState = 'paused';

    // 2. 设置MV视频源并显示弹窗
    mvPlayer.src = mvSources[currentIndex];
    mvModal.style.display = 'flex';

    // 3. 尝试自动播放MV
    mvPlayer.play().catch(err => {
        console.warn('MV自动播放失败，需手动播放：', err);
        alert('温馨提示：受浏览器策略限制，MV无法自动播放，请点击视频区域手动播放～');
    });

    // 4. 同步MV倍速（和音频倍速保持一致）
    mvPlayer.playbackRate = playbackRates[currentRateIndex];

    console.log(`正在播放MV：${mvSources[currentIndex]}`);
}

// 关闭MV播放
function closeMv() {
    // 1. 暂停MV并隐藏弹窗
    mvPlayer.pause();
    mvModal.style.display = 'none';

    // 2. 恢复音频播放状态（如果切换MV前是播放状态）
    if (btnbegin.classList.contains('iconfont icon-zanting')) {
        currentAudio.play();
        img.style.animationPlayState = 'running';
    }

    console.log('MV已关闭，恢复音频播放状态');
}

// MV按钮点击事件
mvBtn.addEventListener('click', playCurrentMv);

// 关闭MV按钮点击事件
closeMvBtn.addEventListener('click', closeMv);

// 点击MV弹窗背景关闭MV
mvModal.addEventListener('click', function (e) {
    if (e.target === mvModal) {
        closeMv();
    }
});

// MV播放结束自动关闭弹窗
mvPlayer.addEventListener('ended', closeMv);

// 倍速切换时同步MV倍速
playbackRateBtn.addEventListener('click', function () {
    // 原有倍速逻辑不变，新增MV倍速同步
    if (mvModal.style.display === 'flex') {
        mvPlayer.playbackRate = playbackRates[currentRateIndex];
        console.log(`MV倍速同步为：${playbackRates[currentRateIndex]}x`);
    }
});

// 切换歌曲时关闭正在播放的MV
function syncMvWithSongSwitch() {
    if (mvModal.style.display === 'flex') {
        mvPlayer.pause();
        mvModal.style.display = 'none';
    }
}

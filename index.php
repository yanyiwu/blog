---
layout: default
title: 不是我干的
---

<div id="home">
    {% raw %}
    <?php 
        $iipp=$_SERVER["REMOTE_ADDR"];  
        if ($iipp === "x.x.x.x") {
            echo "<h1>哥们你今天来访次数有点频繁啊</h1>";
        } else {
            echo "<h1>不是我干的</h1>";
        }
    ?>
    {% endraw %}

    <!--<h1>{{ site.name }}</h1>-->
    <!--<ul class="posts"> -->
    <ul>
        {% for post in site.posts %}
            {% if post.hot == "yes" %}
                <li><span>{{ post.date | date_to_string }}</span> &raquo; <a style="color:#900; border-bottom-color:#900" href="{{ post.url }}">{{ post.title }}</a></li>
            {% endif %}
        {% endfor %}
        {% for post in site.posts %}
            {% if post.hot != "yes" %}
                <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ post.url }}">{{ post.title }}</a></li>
            {% endif %}
        {% endfor %}
    </ul>
</div>


<p><span>.</span><span>.</span><span>.</span></p>

<style>
	/* https://martinwolf.org/before-2018/blog/2015/01/pure-css-savingloading-dots-animation/ */
	@keyframes blink {
	    0% {
	      opacity: .2;
	    }
	    20% {
	      opacity: 1;
	    }
	    100% {
	      opacity: .2;
	    }
	}
	p span {
	    animation-name: blink;
	    animation-duration: 1.4s;
	    animation-iteration-count: infinite;
	    animation-fill-mode: both;
	}
	p span:nth-child(2) {
	    animation-delay: .2s;
	}
	p span:nth-child(3) {
	    animation-delay: .4s;
	}
</style>

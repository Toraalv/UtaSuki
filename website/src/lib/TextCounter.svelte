<script>
	let  {
		inputVal = null,
		error = null,
		maxLength = null,
		style = ""
	} = $props();
</script>

<p style="position: absolute; top: 0; right: 0; margin: 0 10px; height: 100%; align-content: center; {`color: var(--${error ? "warning" : "d2_text"});`}{style}">{maxLength - inputVal.length}</p>


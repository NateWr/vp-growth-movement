<template>
	<span class="spinner" aria-hidden="true" />
</template>

<style>
.spinner {

	&:before {
		display: inline-block;
		position: relative;
		width: 2em;
		height: 2em;
		vertical-align: middle;
		animation: anim_spinner 0.6s linear infinite;
		border-radius: 100%;
		border-top: 0.125em solid currentColor;
		border-bottom: 0.125em solid transparent;
		border-left: 0.125em solid currentColor;
		border-right: 0.125em solid transparent;
		content: '';
		opacity: 1;
	}
}

@keyframes anim_spinner {
	0% {
		transform: rotateZ(-360deg);
	}
	100% {
		transform: rotateZ(0deg);
	}
}
</style>

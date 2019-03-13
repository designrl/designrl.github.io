## Acknowledgments

We would like to thank Luke Metz and Douglas Eck for their thoughtful feedback. This article was prepared using the [Distill](https://distill.pub) [template](https://github.com/distillpub/template).

<h3 id="citation">Citation</h3>

For attribution in academic contexts, please cite this work as

<pre class="citation short">David Ha, "Reinforcement Learning for Improving Agent Design", 2018.</pre>

BibTeX citation

<pre class="citation long">@article{Ha2018designrl,
  author = {David Ha},
  title  = {Reinforcement Learning for Improving Agent Design},
  eprint = {arXiv:1810.03779},
  url    = {https://designrl.github.io},
  note   = "\url{https://designrl.github.io}",
  year   = {2018}
}</pre>

## Open Source Code

The instructions to reproduce the experiments in this work is available [here](https://github.com/hardmaru/astool).

## Reuse

Diagrams and text are licensed under Creative Commons Attribution [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) with the [source available on GitHub](https://github.com/designrl/designrl.github.io), unless noted otherwise. The figures that have been reused from other sources don’t fall under this license and can be recognized by the citations in their caption.

## Configuration

All agents were implemented using 3 layer fully-connected networks with $\tanh$ activations. The agent in *RoboschoolAnt-v1* has 28 inputs and 8 outputs, all bounded between $-1$ and $+1$, with hidden layers of 64 and 32 units. The agents in *BipedalWalker-v2* and *BipedalWalkerHardcore-v2* has 24 inputs and 4 outputs all bounded between $-1$ and $+1$, with 2 hidden layers of 40 units each.

## Training

Our population-based training experiments were conducted on 96-CPU core machines on Google Cloud Platform. Following the approach described in <dt-cite key="stablees"></dt-cite>, we used a population size of 192, and had each agent perform the task 16 times with different initial random seeds. The agent's reward signal used by the policy gradient method is the average reward of the 16 rollouts. Baseline agents were trained for 8000 generations, while learnable environments used 3000 generations.

## Population-based Policy Gradient Method

In this section we provide an overview of the population-based policy gradient method described in Section 6 of William's REINFORCE<dt-cite key="williams1992"></dt-cite> paper for learning a parameter vector $w$ in a reinforcement learning environment. Subsequent population-based methods based on Sec. 6 of REINFORCE include PGPE<dt-cite key="pepg"></dt-cite>, NES<dt-cite key="wierstra2008natural"></dt-cite>, and OpenAI-ES<dt-cite key="openai_es"></dt-cite>. These population-based policy gradient methods are also closely related to CMA-ES<dt-cite key="cmaes,akimoto2012theoretical"></dt-cite>. In this approach, $w$ is sampled from a probability distribution $\pi(w, \theta)$ parameterized by $\theta$. We define the expected cumulative reward $R$ as:

$J(\theta) = E_{\theta}[R(w)] = \int R(w) \; \pi(w, \theta) \; dw$

Using the *log-likelihood trick* allows us to write the gradient of $J(\theta)$ with respect to $\theta$:

$\nabla_{\theta} J(\theta) = E_{\theta}[ \; R(w)  \; \nabla_{\theta} \log \pi(w, \theta) \; ]$.

In a population size of $N$, where we have solutions $w^1$, $w^2$, ..., $w^N$, we can estimate this as:

$\nabla_{\theta} J(\theta) \approx \frac{1}{N} \sum_{i=1}^{N} \; R(w^i)  \; \nabla_{\theta} \log \pi(w^i, \theta)$.

With this approximated gradient $\nabla_{\theta} J(\theta)$, we then can optimize $\theta$ using gradient ascent:

$\theta \rightarrow \theta + \alpha \nabla_{\theta} J(\theta)$

and sample a new set of candidate solutions $w$ from updating the pdf using learning rate $\alpha$. We follow the approach in REINFORCE where $\pi$ is modelled as a factored multi-variate normal distribution. Williams derived closed-form formulas of the gradient $\nabla_{\theta} \log \pi(w^i, \theta)$. In this special case, $\theta$ will be the set of mean $\mu$ and standard deviation $\sigma$ parameters. Therefore, each element of a solution can be sampled from a univariate normal distribution $w_j \sim N(\mu_j, \sigma_j)$. Williams derived the closed-form formulas for the $\nabla_{\theta} \log N(z^i, \theta)$ term for each individual $\mu$ and $\sigma$ element of vector $\theta$ on each solution $i$ in the population:

$\nabla_{\mu_{j}} \log N(w^i, \theta) = \frac{w_j^i - \mu_j}{\sigma_j^2},$ $\nabla_{\sigma_{j}} \log N(w^i, \theta) = \frac{(w_j^i - \mu_j)^2 - \sigma_j^2}{\sigma_j^3}$.

For clarity, we use subscript $j$, to count across parameter space in $w$, and this is not to be confused with superscript $i$, used to count across each sampled member of the population of size $N$. Combining the last two equations, we can update $\mu_j$ and $\sigma_j$ at each generation via a gradient update.

## Bloopers

For those of you who made it this far, we would like to share some “negative results” of things that we tried but didn't work. In the experiments, we constrain the elements in the modified design to be $\pm$ 75\% of the original design's values. We accomplish this by defining a scaling factor for each learnable parameter as $1.0+0.75 \tanh(w_k)$ where $w_k$ is the $k^{\text{th}}$ element of the environment parameter vector, and multiply this scaling factor to the original design's value, and find that this approach works well as it usually preserves the intention and *essence* of the original design.

We also tried to let the RL algorithm discover new designs without any constraints, and found that it would usually create longer rear legs during the initial learning phase designed so it can tumble over further down the map to achieve higher rewards.

<div style="text-align: center;">
<video class="b-lazy" data-src="https://storage.googleapis.com/quickdraw-models/sketchRNN/designrl/augmentbipedsmalllegs.lognormal.blooper.mp4" type="video/mp4" autoplay muted playsinline loop style="display: block; margin: auto; width: 100%;" ></video>
<figcaption style="text-align: left;">Without any design constraints, it develops very long rear legs so it can finish further down the map.</figcaption>
</div>

Using a lognormal scaling factor of $\exp(w_k)$ made it easier for the RL algorithm to come up with an extremely tall bipedal walker agent that “solves” the task by simply falling over and landing at the exit:

<div style="text-align: center;">
<video class="b-lazy" data-src="https://storage.googleapis.com/quickdraw-models/sketchRNN/designrl/augmentbipedhard.lognormal.blooper.mp4" type="video/mp4" autoplay muted playsinline loop style="display: block; margin: auto; width: 100%;" ></video>
<figcaption style="text-align: left;">If we remove all design constraints, the optimizer came up with a really tall bipedal walker robot that “solves” the task by simply falling over and landing near the exit.</figcaption>
</div>

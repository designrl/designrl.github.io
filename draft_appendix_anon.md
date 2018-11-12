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